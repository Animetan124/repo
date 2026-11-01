import { ref } from 'vue'

const BASE = 'http://127.0.0.1:3100'

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    mode: 'cors',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  const text = await res.text()
  try { return JSON.parse(text) } catch { return text }
}

export function useStationApi() {
  const loading = ref(false)
  const error = ref(null)

  const getSettings = () => request('/api/settings')
  const saveSettings = (data) => request('/api/settings', { method: 'POST', body: JSON.stringify(data) })
  const testSsh = () => request('/api/test')
  const testAi = (payload) => request('/api/ai/test', { method: 'POST', body: JSON.stringify(payload || {}) })
  const execCommand = (cmd) => request('/api/exec', { method: 'POST', body: JSON.stringify({ cmd }) })
  const ls = (path) => request(`/api/ls?path=${encodeURIComponent(path || '/')}`)
  const bridgeStatus = () => request('/api/bridge').catch(() => ({ ok: false, message: 'Bridge не отвечает' }))

  async function withLoading(fn) {
    loading.value = true; error.value = null
    try { return await fn() }
    catch (e) { error.value = e.message; throw e }
    finally { loading.value = false }
  }

  return { loading, error, getSettings, saveSettings, testSsh, testAi, execCommand, ls, bridgeStatus, withLoading }
}