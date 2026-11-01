<template>
  <q-page class="conn-page q-px-md q-py-lg md:q-px-lg">
    <!-- ===== Шапка страницы ===== -->
    <header class="conn-header q-mb-lg">
      <div class="row items-center q-gutter-sm">
        <div class="conn-header__icon">
          <q-icon name="lan" size="22px" />
        </div>
        <div>
          <h1 class="text-h5 text-weight-semibold q-mb-none">Подключение к станции</h1>
          <p class="text-body2 text-grey-5 q-mt-xs q-mb-none">
            Параметры SSH-соединения с Яндекс Станцией Mini 2
          </p>
        </div>
      </div>

      <q-chip :icon="status.icon" :color="status.color" text-color="white" class="q-ma-none">
        {{ status.label }}
      </q-chip>
    </header>

    <div class="row q-col-gutter-lg">
      <!-- ===== Форма SSH ===== -->
      <section class="col-12 col-lg-7 col-xl-6">
        <q-card class="conn-card" flat bordered>
          <q-card-section class="conn-card__header row items-center q-gutter-sm">
            <div class="conn-card__icon-wrap">
              <q-icon name="vpn_key" size="20px" />
            </div>
            <div>
              <div class="text-subtitle1 text-weight-semibold">Параметры SSH</div>
              <div class="text-caption text-grey-6">Данные для доступа к станции</div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <q-form class="q-gutter-md" @submit.prevent="checkConnection">
              <q-input
                v-model="form.host"
                label="IP-адрес станции"
                placeholder="192.168.100.46"
                outlined dense dark
                autocomplete="off"
                :rules="[ruleRequired, ruleIp]"
              >
                <template #prepend><q-icon name="router" /></template>
              </q-input>

              <q-input
                v-model.number="form.port"
                type="number" min="1" max="65535"
                label="SSH-порт"
                outlined dense dark
                autocomplete="off"
                :rules="[ruleRequired, rulePort]"
              >
                <template #prepend><q-icon name="settings_ethernet" /></template>
              </q-input>

              <q-input
                v-model="form.user"
                label="Имя пользователя"
                placeholder="root"
                outlined dense dark
                autocomplete="username"
                :rules="[ruleRequired]"
              >
                <template #prepend><q-icon name="person" /></template>
              </q-input>

              <q-input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                :label="hasPassword ? 'Пароль SSH (сохранён, можно не вводить)' : 'Пароль SSH'"
                outlined dense dark
                autocomplete="new-password"
                :rules="[rulePass]"
              >
                <template #prepend><q-icon name="vpn_key" /></template>
                <template #append>
                  <q-icon
                    :name="showPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </q-input>

              <div class="row q-gutter-sm q-mt-md">
                <q-btn
                  type="submit"
                  color="primary"
                  icon="network_check"
                  label="Проверить подключение"
                  unelevated no-caps
                  :loading="testing"
                />
                <q-btn flat color="grey-5" icon="restart_alt" label="Сбросить" no-caps @click="resetForm" />
              </div>
            </q-form>
          </q-card-section>

          <q-separator />

          <q-card-section class="q-py-sm">
            <div class="row items-center q-gutter-sm text-caption text-grey-5">
              <q-icon name="info" size="16px" />
              <span>Проверка входит на станцию по SSH через сервер панели (порт 3100).</span>
            </div>
          </q-card-section>
        </q-card>
      </section>

      <!-- ===== Правая колонка ===== -->
      <aside class="col-12 col-lg-5 col-xl-6">
        <q-card class="conn-card q-mb-lg" flat bordered>
          <q-card-section class="conn-card__header row items-center q-gutter-sm">
            <div class="conn-card__icon-wrap">
              <q-icon name="summary" size="20px" />
            </div>
            <div>
              <div class="text-subtitle1 text-weight-semibold">Текущие параметры</div>
              <div class="text-caption text-grey-6">Значения из формы слева</div>
            </div>
          </q-card-section>

          <q-separator />

          <q-list separator>
            <q-item v-for="row in summary" :key="row.label">
              <q-item-section avatar>
                <q-icon :name="row.icon" color="grey-5" size="20px" />
              </q-item-section>
              <q-item-section>
                <q-item-label caption class="text-grey-5">{{ row.label }}</q-item-label>
                <q-item-label class="text-body2">{{ row.value }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>

        <q-card class="conn-card" flat bordered>
          <q-card-section class="conn-card__header row items-center q-gutter-sm">
            <div class="conn-card__icon-wrap">
              <q-icon name="lightbulb" size="20px" />
            </div>
            <div class="text-subtitle1 text-weight-semibold">Подсказки</div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <ul class="conn-tips q-pl-lg q-mb-none text-body2 text-grey-4">
              <li>Станция и компьютер должны быть в одной сети.</li>
              <li>IP смотри в роутере или в приложении «Дом с Алисой».</li>
              <li>Если пишет «сервер панели недоступен» — запусти npm start в папке station-panel.</li>
            </ul>
          </q-card-section>
        </q-card>
      </aside>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '@/composables/useStation'

const $q = useQuasar()

const DEFAULTS = { host: '192.168.100.46', port: 2222, user: 'root', password: '' }

const form = reactive({ ...DEFAULTS })
const showPassword = ref(false)
const hasPassword = ref(false)
const testing = ref(false)
const state = ref('idle') // idle | checking | ok | error

const STATUS_MAP = {
  idle:     { label: 'Не проверено', icon: 'help_outline',  color: 'grey-8' },
  checking: { label: 'Проверка…',    icon: 'hourglass_top', color: 'primary' },
  ok:       { label: 'Подключено',   icon: 'check_circle',  color: 'positive' },
  error:    { label: 'Ошибка',       icon: 'error',         color: 'negative' }
}
const status = computed(() => STATUS_MAP[state.value])

const summary = computed(() => [
  { icon: 'router',            label: 'IP-адрес',     value: form.host || '—' },
  { icon: 'settings_ethernet', label: 'Порт',         value: form.port || '—' },
  { icon: 'person',            label: 'Пользователь', value: form.user || '—' },
  {
    icon: 'vpn_key', label: 'Пароль',
    value: form.password ? '•'.repeat(form.password.length) : (hasPassword.value ? 'сохранён на сервере панели' : '—')
  }
])

const ruleRequired = v => (v !== null && v !== '' && v !== undefined) || 'Поле обязательно'
const rulePass = v => hasPassword.value || !!v || 'Поле обязательно'
const ruleIp   = v => /^((25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(25[0-5]|2[0-4]\d|1?\d?\d)$/.test(v) || 'Формат: 192.168.0.10'
const rulePort = v => (Number(v) >= 1 && Number(v) <= 65535) || 'Порт от 1 до 65535'

onMounted(async () => {
  const s = await api('settings')
  if (!s) { state.value = 'error'; return }
  Object.assign(form, { host: s.host, port: s.port, user: s.user })
  hasPassword.value = s.hasPassword
})

function resetForm () {
  Object.assign(form, DEFAULTS)
  state.value = 'idle'
}

async function checkConnection () {
  testing.value = true
  state.value = 'checking'
  const saved = await api('settings', {
    conn: { host: form.host, port: form.port, user: form.user, password: form.password }
  })
  if (!saved) { state.value = 'error'; testing.value = false; return }
  hasPassword.value = saved.hasPassword
  form.password = ''

  const r = await api('test')
  if (!r) {
    state.value = 'error'
  } else {
    state.value = r.ok ? 'ok' : 'error'
    $q.notify({
      type: r.ok ? 'positive' : 'negative',
      message: r.ok ? 'Станция отвечает: ' + (r.out.split('\n')[1] || 'вход выполнен') : r.out
    })
  }
  testing.value = false
}
</script>

<style scoped lang="scss">
.conn-page { max-width: 1100px; margin: 0 auto; }

.conn-header {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 12px;
}
.conn-header__icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(103, 80, 164, .16); color: #b39ddb;
}

.conn-card {
  border-radius: 14px;
  border-color: rgba(255, 255, 255, .08);
  background: #1a1a1a;
  overflow: hidden;
}
.conn-card__header { background: rgba(255, 255, 255, .03); padding: 14px 16px; }
.conn-card__icon-wrap {
  width: 38px; height: 38px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(103, 80, 164, .16); color: #b39ddb;
}

.conn-tips li { margin-bottom: 6px; }
.conn-tips li::marker { color: #b39ddb; }

/* Убираем жёлтую заливку автозаполнения Chrome */
.conn-card :deep(input:-webkit-autofill),
.conn-card :deep(input:-webkit-autofill:hover),
.conn-card :deep(input:-webkit-autofill:focus) {
  -webkit-box-shadow: 0 0 0 1000px #1e1e1e inset;
  box-shadow: 0 0 0 1000px #1e1e1e inset;
  -webkit-text-fill-color: #eee;
  caret-color: #eee;
  transition: background-color 5000s ease-in-out 0s;
}

.conn-card :deep(.q-field--outlined .q-field__control) { border-radius: 10px; }
</style>