<template>
  <q-page class="st-page q-px-md q-py-lg">
    <h1 class="text-h5 text-weight-semibold q-mt-none q-mb-xs">Конфигурация</h1>
    <p class="text-body2 text-grey-5 q-mb-lg">
      Откройте config.json или runtime.env. Перед сохранением рядом создаётся копия с суффиксом .bak-дата.
    </p>

    <q-card class="st-card q-mb-lg" flat bordered>
      <q-card-section>
        <q-input v-model="dir" label="Папка на станции" outlined dense dark @keyup.enter="list()">
          <template #append>
            <q-btn flat round icon="arrow_upward" @click="up" />
            <q-btn flat round icon="folder_open" @click="list()" />
          </template>
        </q-input>
        <div v-if="error" class="text-negative q-mt-sm">{{ error }}</div>
      </q-card-section>
      <q-separator />
      <q-list separator style="max-height: 280px; overflow: auto">
        <q-item v-for="name in items" :key="name" clickable @click="openItem(name)">
          <q-item-section avatar>
            <q-icon :name="name.endsWith('/') ? 'folder' : 'description'" color="grey-5" />
          </q-item-section>
          <q-item-section>{{ name }}</q-item-section>
        </q-item>
        <q-item v-if="!items.length && !error"><q-item-section class="text-grey-6">Папка пуста</q-item-section></q-item>
      </q-list>
    </q-card>

    <q-card v-if="file" class="st-card" flat bordered>
      <q-card-section>
        <div class="text-subtitle2 q-mb-sm">{{ file }}</div>
        <q-input v-model="body" type="textarea" outlined dark input-class="st-mono" :input-style="{ minHeight: '320px' }" spellcheck="false" />
        <q-btn class="q-mt-md" color="primary" unelevated no-caps icon="save" label="Сохранить на станции" :loading="saving" @click="save" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '@/composables/useStation'

const $q = useQuasar()
const dir = ref('')
const items = ref([])
const error = ref('')
const file = ref('')
const body = ref('')
const saving = ref(false)

const base = () => dir.value.replace(/\/+$/, '')

async function list (p) {
  const r = await api('ls?path=' + encodeURIComponent(p ?? dir.value))
  if (!r) return
  dir.value = r.path.replace(/\/+$/, '') || '/'
  items.value = r.code ? [] : r.items
  error.value = r.code ? (r.out || 'Папка недоступна') : ''
}

function up () { list(base().split('/').slice(0, -1).join('/') || '/') }

async function openFile (path) {
  const r = await api('file?path=' + encodeURIComponent(path))
  if (!r) return
  file.value = path
  body.value = r.out
}

function openItem (name) {
  if (name.endsWith('/')) list(base() + '/' + name.slice(0, -1))
  else openFile(base() + '/' + name)
}

async function save () {
  saving.value = true
  const r = await api('file', { path: file.value, content: body.value })
  saving.value = false
  if (!r) return
  $q.notify(r.ok
    ? { type: 'positive', message: 'Сохранено. Копия: ' + r.backup.split('/').pop() }
    : { type: 'negative', message: 'Не сохранено: ' + r.out })
}

onMounted(async () => {
  const s = await api('settings')
  if (s) { dir.value = s.bridgeDir; list() }
})
</script>

<style scoped lang="scss">
.st-page { max-width: 900px; margin: 0 auto; }
.st-card { border-radius: 14px; border-color: rgba(255, 255, 255, .08); background: #1a1a1a; }
:deep(.st-mono) { font-family: ui-monospace, Consolas, monospace; font-size: 13px; }
</style>
