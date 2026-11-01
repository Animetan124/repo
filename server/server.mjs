// Панель управления Яндекс Станцией: локальный сервер, который ходит на станцию по SSH.
// Запуск: PANEL_PASSWORD=секрет npm start  → http://IP_СЕРВЕРА:3100 (логин admin)
// Для локальной отладки без пароля: HOST=127.0.0.1 npm start
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { Client } from 'ssh2';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.join(DIR, 'data', 'settings.json');
const PORT = +process.env.PORT || 3100;
const HOST = process.env.HOST || '0.0.0.0';
const PASS = process.env.PANEL_PASSWORD || '';
const LOGIN = process.env.PANEL_USER || 'admin';
if (!PASS && HOST !== '127.0.0.1') {
  console.error('Задайте пароль панели: PANEL_PASSWORD=... (или HOST=127.0.0.1 для локальной отладки)');
  process.exit(1);
}
// Собранный интерфейс Quasar лежит в папке web/ (содержимое dist/spa); если её нет, берётся простая страница из public/
const WEB = fs.existsSync(path.join(DIR, 'web', 'index.html')) ? path.join(DIR, 'web') : path.join(DIR, 'public');
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.map': 'application/json', '.webmanifest': 'application/manifest+json',
};
process.on('uncaughtException', (e) => console.error('Ошибка:', e));
process.on('unhandledRejection', (e) => console.error('Ошибка:', e));

const same = (a, b) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && crypto.timingSafeEqual(x, y); };
function authed(req) {
  if (!PASS) return true;
  const h = req.headers.authorization || '';
  if (!h.startsWith('Basic ')) return false;
  const [u, ...p] = Buffer.from(h.slice(6), 'base64').toString().split(':');
  return same(u, LOGIN) && same(p.join(':'), PASS);
}
function serveStatic(pathname, res) {
  let file;
  try { file = path.join(WEB, decodeURIComponent(pathname)); } catch { res.writeHead(400); return res.end(); }
  if (file !== WEB && !file.startsWith(WEB + path.sep)) { res.writeHead(403); return res.end(); }
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(WEB, 'index.html'); // history-режим Vue Router
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}

const defaults = {
  host: '192.168.100.46', port: 2222, user: 'root', password: '', keyPath: '',
  bridgeDir: '/data/opt/quasar-bridge',
  ai: { baseUrl: 'https://ru.cheapvibecode.ru/v1', model: 'deepseek-flash', apiKey: '', type: 'chat' },
};
const load = () => {
  try { const s = JSON.parse(fs.readFileSync(FILE, 'utf8')); return { ...defaults, ...s, ai: { ...defaults.ai, ...s.ai } }; }
  catch { return structuredClone(defaults); }
};
const save = (s) => {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(s, null, 2), { mode: 0o600 });
};
const q = (s) => "'" + String(s).replace(/'/g, "'\\''") + "'";
const masked = (s) => ({ ...s, password: '', hasPassword: !!s.password, ai: { ...s.ai, apiKey: '', hasKey: !!s.ai.apiKey } });

// Выполняет одну команду на станции. input — текст для stdin (нужен для записи файлов).
function ssh(cmd, input = '', timeout = 20000) {
  const s = load();
  return new Promise((resolve) => {
    const c = new Client();
    let out = '', done = false;
    const fin = (code, extra = '') => {
      if (done) return;
      done = true; clearTimeout(timer);
      try { c.end(); } catch {}
      resolve({ code, out: out + extra });
    };
    const timer = setTimeout(() => fin(-1, '\n[таймаут: станция не ответила]'), timeout);
    c.on('ready', () => c.exec(cmd, (err, st) => {
      if (err) return fin(-1, err.message);
      st.on('data', (d) => (out += d));
      st.stderr.on('data', (d) => (out += d));
      st.on('close', (code) => fin(code ?? 0));
      st.end(input);
    }));
    c.on('keyboard-interactive', (_n, _i, _l, _p, finish) => finish([s.password]));
    c.on('error', (e) => fin(-1, 'Ошибка SSH: ' + e.message));
    try {
      const cfg = { host: s.host, port: +s.port, username: s.user, readyTimeout: 8000, tryKeyboard: true };
      if (s.keyPath) cfg.privateKey = fs.readFileSync(s.keyPath);
      else cfg.password = s.password;
      c.connect(cfg);
    } catch (e) { fin(-1, 'Ошибка настроек: ' + e.message); }
  });
}

async function aiTest(a) {
  const base = a.baseUrl.replace(/\/+$/, '');
  const headers = { 'content-type': 'application/json', authorization: 'Bearer ' + a.apiKey };
  const resp = a.type === 'responses'
    ? [base + '/responses', { model: a.model, input: 'Ответь одним словом: ок', max_output_tokens: 32 }]
    : [base + '/chat/completions', { model: a.model, messages: [{ role: 'user', content: 'Ответь одним словом: ок' }], max_tokens: 32 }];
  const t0 = Date.now();
  try {
    const r = await fetch(resp[0], { method: 'POST', headers, body: JSON.stringify(resp[1]), signal: AbortSignal.timeout(30000) });
    const text = await r.text();
    return { ok: r.ok, status: r.status, ms: Date.now() - t0, body: text.slice(0, 800) };
  } catch (e) { return { ok: false, status: 0, ms: Date.now() - t0, body: String(e.message || e) }; }
}

const ACTIONS = ['status', 'logs', 'check', 'check-backends', 'restart', 'rollback'];
const readBody = (req) => new Promise((r) => {
  let b = '';
  req.on('data', (d) => (b += d));
  req.on('end', () => { try { r(JSON.parse(b || '{}')); } catch { r({}); } });
});
const send = (res, code, obj) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(obj)); };

http.createServer(async (req, res) => {
  if (!authed(req)) {
    res.writeHead(401, { 'www-authenticate': 'Basic realm="Panel stancii", charset="UTF-8"' });
    return res.end('Нужен вход');
  }
  const url = new URL(req.url, 'http://x');
  if (!url.pathname.startsWith('/api/')) return serveStatic(url.pathname, res);
  if (req.headers['x-panel'] !== '1') return send(res, 404, { error: 'not found' });

  const b = req.method === 'POST' ? await readBody(req) : {};
  const s = load();

  if (url.pathname === '/api/settings' && req.method === 'GET') return send(res, 200, masked(s));
  if (url.pathname === '/api/settings') {
    const n = { ...s, ...b.conn, ai: { ...s.ai, ...b.ai } };
    if (!b.conn?.password) n.password = s.password;
    if (!b.ai?.apiKey) n.ai.apiKey = s.ai.apiKey;
    save(n);
    return send(res, 200, masked(n));
  }
  if (url.pathname === '/api/test') {
    const r = await ssh('echo ok; uname -a; id -un', '', 12000);
    return send(res, 200, { ok: r.code === 0 && r.out.startsWith('ok'), out: r.out });
  }
  if (url.pathname === '/api/bridge') {
    if (!ACTIONS.includes(b.action)) return send(res, 400, { error: 'неизвестное действие' });
    const r = await ssh(`sh ${q(s.bridgeDir + '/app/control.sh')} ${b.action}`, '', 60000);
    return send(res, 200, r);
  }
  if (url.pathname === '/api/exec') return send(res, 200, await ssh(String(b.cmd || 'true'), '', 60000));
  if (url.pathname === '/api/ls') {
    const p = url.searchParams.get('path') || s.bridgeDir;
    const r = await ssh(`ls -1Ap ${q(p)}`);
    return send(res, 200, { path: p, code: r.code, items: r.code === 0 ? r.out.split('\n').filter(Boolean) : [], out: r.code ? r.out : '' });
  }
  if (url.pathname === '/api/file' && req.method === 'GET') {
    const r = await ssh(`cat ${q(url.searchParams.get('path'))}`);
    return send(res, 200, r);
  }
  if (url.pathname === '/api/file') {
    const p = q(b.path), ts = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const r = await ssh(`cp ${p} ${q(b.path + '.bak-' + ts)} 2>/dev/null; cat > ${p}.new && mv ${p}.new ${p} && echo saved`, b.content ?? '');
    return send(res, 200, { ok: r.out.includes('saved'), out: r.out, backup: b.path + '.bak-' + ts });
  }
  if (url.pathname === '/api/ai/test') {
    const a = { ...s.ai, ...b.ai };
    if (!b.ai?.apiKey) a.apiKey = s.ai.apiKey;
    if (!a.apiKey) return send(res, 200, { ok: false, status: 0, ms: 0, body: 'Ключ API не задан' });
    return send(res, 200, await aiTest(a));
  }
  send(res, 404, { error: 'not found' });
}).listen(PORT, HOST, () => console.log(`Панель станции: http://${HOST}:${PORT}`));
