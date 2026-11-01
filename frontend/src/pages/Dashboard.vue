<template>
  <q-page class="dash-page q-px-md q-py-lg md:q-px-lg">
    <header class="dash-header q-mb-lg">
      <div class="row items-center q-gutter-sm">
        <div class="dash-header__icon"><q-icon name="dashboard" size="22px" /></div>
        <div>
          <h1 class="text-h5 text-weight-semibold q-mb-none">Обзор станции</h1>
          <p class="text-body2 text-grey-5 q-mt-xs q-mb-none">Состояние подключения, Bridge и активность</p>
        </div>
      </div>
      <q-btn flat color="grey-5" icon="refresh" label="Обновить" no-caps @click="refresh" :loading="api.loading.value" />
    </header>

    <div class="row q-col-gutter-md q-mb-lg">
      <q-card v-for="c in cards" :key="c.title" flat bordered class="stat-card col-12 col-sm-6 col-md-3">
        <q-card-section class="row items-center q-gutter-sm">
          <div class="stat-card__icon" :style="{ background: c.bg, color: c.fg }">
            <q-icon :name="c.icon" size="22px" />
          </div>
          <div class="col">
            <div class="text-caption text-grey-5">{{ c.title }}</div>
            <div class="text-h6 text-weight-semibold q-mt-xs">{{ c.value }}</div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-section class="q-py-sm">
          <q-badge :color="c.badgeColor" class="q-mr-sm">{{ c.status }}</q-badge>
          <span class="text-caption text-grey-6">{{ c.subtitle }}</span>
        </q-card-section>
      </q-card>
    </div>

    <div class="row q-col-gutter-lg">
      <section class="col-12 col-md-6">
        <q-card flat bordered class="detail-card">
          <q-card-section class="row items-center q-gutter-sm">
            <div class="detail-card__icon"><q-icon name="lan" size="20px" /></div>
            <div>
              <div class="text-subtitle1 text-weight-semibold">Параметры подключения</div>
              <div class="text-caption text-grey-6">SSH-доступ к станции</div>
            </div>
          </q-card-section>
          <q-separator />
          <q-list separator>
            <q-item v-for="row in connRows" :key="row.label">
              <q-item-section avatar><q-icon :name="row.icon" color="grey-5" /></q-item-section>
              <q-item-section>
                <q-item-label caption class="text-grey-5">{{ row.label }}</q-item-label>
                <q-item-label>{{ row.value }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </section>

      <section class="col-12 col-md-6">
        <q-card flat bordered class="detail-card">
          <q-card-section class="row items-center q-gutter-sm">
            <div class="detail-card__icon"><q-icon name="psychology" size="20px" /></div>
            <div>
              <div class="text-subtitle1 text-weight-semibold">Искусственный интеллект</div>
              <div class="text-caption text-grey-6">Модель и провайдер</div>
            </div>
          </q-card-section>
          <q-separator />
          <q-list separator>
            <q-item v-for="row in aiRows" :key="row.label">
              <q-item-section avatar><q-icon :name="row.icon" color="grey-5" /></q-item-section>
              <q-item-section>
                <q-item-label caption class="text-grey-5">{{ row.label }}</q-item-label>
                <q-item-label>{{ row.value }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </section>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useStationApi } from '@/composables/useStationApi'

const $q = useQuasar()
const api = useStationApi()

const settings = ref({})
const sshOk = ref(null)
const bridgeOk = ref(null)

const cards = computed(() => [
  {
    title: 'SSH-соединение', icon: 'vpn_key',
    bg: 'rgba(76, 175, 80, .15)', fg: '#81c784',
    value: settings.value.host || '—',
    status: sshOk.value === null ? 'не проверено' : sshOk.value ? 'онлайн' : 'ошибка',
    badgeColor: sshOk.value === null ? 'grey' : sshOk.value ? 'positive' : 'negative',
    subtitle: `порт ${settings.value.port || 22}`
  },
  {
    title: 'Quasar Bridge', icon: 'hub',
    bg: 'rgba(33, 150, 243, .15)', fg: '#64b5f6',
    value: bridgeOk.value === null ? '—' : bridgeOk.value ? 'запущен' : 'недоступен',
    status: bridgeOk.value === null ? 'не проверено' : bridgeOk.value ? 'работает' : 'ошибка',
    badgeColor: bridgeOk.value === null ? 'grey' : bridgeOk.value ? 'info' : 'negative',
    subtitle: settings.value.bridgeDir || '/data/opt/quasar-bridge'
  },
  {
    title: 'ИИ-модель', icon: 'psychology',
    bg: 'rgba(156, 39, 176, .15)', fg: '#ba68c8',
    value: settings.value.ai?.model || '—',
    status: settings.value.ai?.baseUrl ? 'настроена' : 'не настроена',
    badgeColor: settings.value.ai?.baseUrl ? 'positive' : 'warning',
    subtitle: settings.value.ai?.type || 'chat'
  },
  {
    title: 'Пользователь', icon: 'person',
    bg: 'rgba(255, 152, 0, .15)', fg: '#ffb74d',
    value: settings.value.user || '—',
    status: settings.value.password || settings.value.keyPath ? 'авторизован' : 'нет пароля',
    badgeColor: settings.value.password || settings.value.keyPath ? 'positive' : 'warning',
    subtitle: settings.value.keyPath ? 'по ключу' : 'по паролю'
  }
])

const connRows = computed(() => [
  { icon: 'router', label: 'IP-адрес', value: settings.value.host || '—' },
  { icon: 'settings_ethernet', label: 'SSH-порт', value: settings.value.port || '—' },
  { icon: 'person', label: 'Пользователь', value: settings.value.user || '—' },
  { icon: 'folder', label: 'Bridge', value: settings.value.bridgeDir || '—' }
])

const aiRows = computed(() => [
  { icon: 'public', label: 'Endpoint', value: settings.value.ai?.baseUrl || '—' },
  { icon: 'memory', label: 'Модель', value: settings.value.ai?.model || '—' },
  { icon: 'key', label: 'API-ключ', value: settings.value.ai?.apiKey ? '•'.repeat(12) : '—' },
  { icon: 'chat', label: 'Тип', value: settings.value.ai?.type || '—' }
])

async function refresh() {
  await api.withLoading(async () => {
    settings.value = await api.getSettings()
    try { await api.testSsh(); sshOk.value = true } catch { sshOk.value = false }
    try { const r = await api.bridgeStatus(); bridgeOk.value = !!r?.ok } catch { bridgeOk.value = false }
  })
  $q.notify({ type: 'positive', message: 'Данные обновлены' })
}

onMounted(() => api.withLoading(() => api.getSettings().then(s => settings.value = s)).catch(() => {}))
</script>

<style scoped lang="scss">
.dash-page { max-width: 1200px; margin: 0 auto; }
.dash-header {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 12px;
}
.dash-header__icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(103, 80, 164, .16); color: #b39ddb;
}
.stat-card, .detail-card {
  border-radius: 14px; border-color: rgba(255,255,255,.08);
  background: #1a1a1a; overflow: hidden;
}
.stat-card__icon, .detail-card__icon {
  width: 42px; height: 42px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
}
.detail-card__icon { background: rgba(103, 80, 164, .16); color: #b39ddb; }
</style>