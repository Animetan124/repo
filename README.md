# Station Panel вЂ” Yandex Station Mini 2 admin

Monorepo:
- `frontend/` вЂ” Quasar (Vue 3) admin UI source (quasar-admin-1 template)
- `server/`   вЂ” Node.js backend (`server.mjs`, ssh2) + built UI in `server/web/`
- `Start-Station-Panel.bat` вЂ” one-click launcher: installs deps, starts server on port 3100, opens browser

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
    GET  /api/settings   вЂ” current settings (password masked)
    POST /api/settings   вЂ” save settings JSON (format: server/data/settings.example.json)
    GET  /api/test       вЂ” SSH connection test
    POST /api/ai/test    вЂ” LLM test
    POST /api/exec       вЂ” run command on station via SSH, body { "cmd": "..." }
    GET  /api/ls?path=   вЂ” list files on station
    GET  /api/file       вЂ” read file on station
    POST /api/file       вЂ” write file on station
    GET  /api/bridge     вЂ” Quasar Bridge status
    other paths          вЂ” static files from server/web/

## Key frontend files
    frontend/src/config/navigation.js        вЂ” sidebar menu
    frontend/src/router/routes.js            вЂ” routes
    frontend/src/composables/useStationApi.js вЂ” API client (base http://127.0.0.1:3100)
    frontend/src/pages/Connection.vue        вЂ” SSH settings page
    frontend/src/pages/Dashboard.vue         вЂ” overview / statistics cards
    frontend/src/pages/AiSettings.vue        вЂ” AI fine-tune: LLM writes / TTS speaks / ASR listens

## Rules for AI assistants
- UI language is Russian; keep new labels in Russian.
- Dark theme card style: radius 14px, background #1a1a1a, border rgba(255,255,255,.08).
- NEVER commit `server/data/settings.json` (real SSH password and API keys live there).
- Server has no build step: edit `server.mjs` and restart the bat.
