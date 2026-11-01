import { Notify } from 'quasar'

// Запрос к серверу панели (station-panel, порт 3100). Через dev-прокси: /api → 127.0.0.1:3100.
// При ошибке показывает уведомление и возвращает null.
export async function api (path, body) {
  try {
    const res = await fetch('/api/' + path, {
      method: body ? 'POST' : 'GET',
      headers: { 'x-panel': '1', 'content-type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    })
    if (!res.ok) throw new Error('HTTP ' + res.status)
    return await res.json()
  } catch {
    Notify.create({
      type: 'negative',
      timeout: 6000,
      message: 'Сервер панели недоступен. Запустите npm start в папке station-panel (порт 3100).'
    })
    return null
  }
}
