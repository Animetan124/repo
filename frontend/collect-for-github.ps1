# ============================================================
#  Collect the whole station-panel project into ONE folder
#  ready for GitHub. Secrets are NOT copied.
#  Run:  .\collect-for-github.ps1
# ============================================================
$ErrorActionPreference = 'Stop'

$front = 'C:\Users\BIS\Desktop\quasar-admin-1'
$back  = 'C:\Users\BIS\Desktop\station-panel-all\server'
$dst   = 'C:\Users\BIS\Desktop\station-panel-repo'

if (-not (Test-Path $front)) { Write-Host "FRONTEND NOT FOUND: $front" -ForegroundColor Red; exit 1 }
if (-not (Test-Path $back))  { Write-Host "SERVER NOT FOUND: $back"  -ForegroundColor Red; exit 1 }

if (Test-Path $dst) { Remove-Item -Recurse -Force $dst }
New-Item -ItemType Directory -Path $dst            | Out-Null
New-Item -ItemType Directory -Path "$dst\frontend" | Out-Null
New-Item -ItemType Directory -Path "$dst\server"   | Out-Null

Write-Host 'Copying frontend source (skip node_modules/dist/.quasar)...'
robocopy $front "$dst\frontend" /E /XD node_modules dist .quasar .git .vscode /XF *.log | Out-Null

Write-Host 'Copying server (skip node_modules, secrets, source maps)...'
robocopy $back "$dst\server" /E /XD node_modules .git /XF settings.json *.log *.map | Out-Null

$bat = @(
  'C:\Users\BIS\Desktop\station-panel-all\Start-Station-Panel.bat',
  'C:\Users\BIS\Desktop\Start-Station-Panel.bat'
) | Where-Object { Test-Path $_ } | Select-Object -First 1
if ($bat) { Copy-Item $bat "$dst\Start-Station-Panel.bat"; Write-Host 'Launcher copied.' }

# ---- safe settings template (no real secrets) ----
New-Item -ItemType Directory -Path "$dst\server\data" -Force | Out-Null
@'
{
  "host": "192.168.100.46",
  "port": 2222,
  "user": "root",
  "password": "CHANGE_ME",
  "keyPath": "",
  "bridgeDir": "/data/opt/quasar-bridge",
  "ai": {
    "baseUrl": "https://your-llm-endpoint/v1",
    "model": "your-model",
    "apiKey": "CHANGE_ME",
    "type": "chat"
  }
}
'@ | Set-Content -Path "$dst\server\data\settings.example.json" -Encoding UTF8

# ---- .gitignore ----
@'
node_modules/
dist/
.quasar/
.vscode/
*.log
*.map
server/data/settings.json
'@ | Set-Content -Path "$dst\.gitignore" -Encoding UTF8

# ---- README for humans and AI assistants ----
@'
# Station Panel — Yandex Station Mini 2 admin

Monorepo:
- `frontend/` — Quasar (Vue 3) admin UI source (quasar-admin-1 template)
- `server/`   — Node.js backend (`server.mjs`, ssh2) + built UI in `server/web/`
- `Start-Station-Panel.bat` — one-click launcher: installs deps, starts server on port 3100, opens browser

## Run (Windows)
1. Double-click `Start-Station-Panel.bat`
2. Open http://127.0.0.1:3100

## Develop the UI
    cd frontend
    npm install
    npm run dev        # http://localhost:9005, expects API at http://127.0.0.1:3100
    npm run build      # output: frontend/dist/spa
    # deploy the build into the server:
    Remove-Item -Recurse -Force ..\server\web
    Copy-Item -Recurse .\dist\spa ..\server\web

## Server API (server/server.mjs, port 3100)
    GET  /api/settings   — current settings (password masked)
    POST /api/settings   — save settings JSON (format: server/data/settings.example.json)
    GET  /api/test       — SSH connection test
    POST /api/ai/test    — LLM test
    POST /api/exec       — run command on station via SSH, body { "cmd": "..." }
    GET  /api/ls?path=   — list files on station
    GET  /api/file       — read file on station
    POST /api/file       — write file on station
    GET  /api/bridge     — Quasar Bridge status
    other paths          — static files from server/web/

## Key frontend files
    frontend/src/config/navigation.js        — sidebar menu
    frontend/src/router/routes.js            — routes
    frontend/src/composables/useStationApi.js — API client (base http://127.0.0.1:3100)
    frontend/src/pages/Connection.vue        — SSH settings page
    frontend/src/pages/Dashboard.vue         — overview / statistics cards
    frontend/src/pages/AiSettings.vue        — AI fine-tune: LLM writes / TTS speaks / ASR listens

## Rules for AI assistants
- UI language is Russian; keep new labels in Russian.
- Dark theme card style: radius 14px, background #1a1a1a, border rgba(255,255,255,.08).
- NEVER commit `server/data/settings.json` (real SSH password and API keys live there).
- Server has no build step: edit `server.mjs` and restart the bat.
'@ | Set-Content -Path "$dst\README.md" -Encoding UTF8

Write-Host ''
Write-Host 'DONE. Folder ready:' -ForegroundColor Green
Write-Host $dst -ForegroundColor Cyan
Write-Host ("Total files: " + (Get-ChildItem $dst -Recurse -File).Count)