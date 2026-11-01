<template>
  <q-page class="st-page q-px-md q-py-lg">
    <h1 class="text-h5 text-weight-semibold q-mt-none q-mb-xs">{{ route.meta.title }}</h1>
    <p class="text-body2 text-grey-5 q-mb-lg">{{ route.meta.description }}</p>

    <q-card class="st-card" flat bordered>
      <q-card-section class="row q-gutter-sm">
        <q-btn
          v-for="a in actions" :key="a.label"
          :color="a.danger ? 'negative' : 'primary'" :outline="!a.main && !a.danger"
          unelevated no-caps :icon="a.icon" :label="a.label"
          :loading="busy === a.label" @click="run(a)"
        />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-input
          v-model="cmd" label="Своя команда на станции" placeholder="ls -la /data/opt"
          outlined dense dark @keyup.enter="runCmd"
        >
          <template #append>
            <q-btn flat round icon="send" :loading="busy === '#cmd'" @click="runCmd" />
          </template>
        </q-input>
        <pre class="st-out">{{ out }}</pre>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from '@/composables/useStation'

const $q = useQuasar()
const route = useRoute()

const bridge = action => () => api('bridge', { action })
const sh = cmd => () => api('exec', { cmd })

const MODES = {
  devices: [
    { label: 'Сеть', icon: 'lan', main: true, go: sh('ifconfig 2>/dev/null || ip addr') },
    { label: 'Процессы', icon: 'memory', go: sh('ps | head -n 80') },
    { label: 'Диски', icon: 'storage', go: sh('df -h') }
  ],
  logs: [
    { label: 'Журнал Bridge', icon: 'article', main: true, go: bridge('logs') },
    { label: 'Журнал системы', icon: 'terminal', go: sh('(logread || dmesg) 2>&1 | tail -n 200') }
  ],
  services: [
    { label: 'Статус', icon: 'monitor_heart', main: true, go: bridge('status') },
    { label: 'Проверка', icon: 'fact_check', go: bridge('check') },
    { label: 'Проверка бэкендов', icon: 'dns', go: bridge('check-backends') },
    { label: 'Перезапуск', icon: 'restart_alt', go: bridge('restart') },
    {
      label: 'Откат к Алисе', icon: 'undo', danger: true, go: bridge('rollback'),
      confirm: 'Вернуть колонку к штатной Алисе? После отката нужна перезагрузка станции.'
    }
  ],
  system: [
    { label: 'Система', icon: 'info', main: true, go: sh('uname -a; uptime; free 2>/dev/null') },
    { label: 'Каталог /data/opt', icon: 'folder', go: sh('ls -la /data/opt') }
  ]
}

const actions = computed(() => MODES[route.meta.mode] || [])
const out = ref('Выберите действие.')
const busy = ref('')
const cmd = ref('')

async function exec (label, go) {
  busy.value = label
  out.value = 'Выполняю…'
  const r = await go()
  busy.value = ''
  out.value = r ? (r.out || '(пустой вывод)') + (r.code ? `\n[код выхода ${r.code}]` : '') : 'Нет ответа от сервера панели'
}

function run (a) {
  if (a.confirm) {
    $q.dialog({ title: 'Подтверждение', message: a.confirm, cancel: true, persistent: true, dark: true })
      .onOk(() => exec(a.label, a.go))
  } else {
    exec(a.label, a.go)
  }
}

function runCmd () {
  if (cmd.value.trim()) exec('#cmd', sh(cmd.value))
}

// Страница переиспользуется между разделами: при смене маршрута сбрасываем вывод и запускаем главное действие.
watch(() => route.path, () => {
  out.value = 'Выберите действие.'
  const main = actions.value.find(a => a.main)
  if (main) exec(main.label, main.go)
}, { immediate: true })
</script>

<style scoped lang="scss">
.st-page { max-width: 1000px; margin: 0 auto; }
.st-card { border-radius: 14px; border-color: rgba(255, 255, 255, .08); background: #1a1a1a; }
.st-out {
  margin: 12px 0 0; padding: 12px; border-radius: 8px; background: #111; overflow: auto;
  max-height: 460px; white-space: pre-wrap; word-break: break-word; font-size: 12.5px;
}
</style>
