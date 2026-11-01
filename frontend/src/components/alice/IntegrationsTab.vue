<template>
  <div>
    <div class="row items-center justify-between q-mb-md">
      <div class="text-subtitle1 text-weight-medium">Интеграции</div>
      <q-btn dense icon="add" label="Добавить" color="primary" @click="showAdd = true" />
    </div>
    <div class="row q-gutter-md">
      <div v-for="i in integrations" :key="i.id" class="col-xs-12 col-md-6">
        <q-card flat bordered class="cursor-pointer" @click="selected = i; showDetail = true">
          <q-card-section>
            <div class="row items-center q-gutter-md">
              <q-avatar size="48px" color="grey-3" text-color="primary" rounded><q-icon :name="i.icon" /></q-avatar>
              <div class="col">
                <div class="row items-center"><div class="text-subtitle1 text-weight-medium">{{ i.name }}</div><q-badge color="grey-5" class="q-ml-sm" flat>v{{ i.version }}</q-badge></div>
                <div class="text-caption text-grey-6">{{ i.description }}</div>
                <StatusBadge :status="i.status" size="sm" class="q-mt-xs" />
              </div>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-actions>
            <q-btn flat dense :label="i.status === 'running' ? 'Остановить' : 'Запустить'" :color="i.status === 'running' ? 'negative' : 'positive'" size="sm" @click.stop="toggle(i)" />
            <q-space />
            <div class="text-caption text-grey-5">Подробнее →</div>
          </q-card-actions>
        </q-card>
      </div>
    </div>
    <q-dialog v-model="showDetail" maximized>
      <q-card v-if="selected">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ selected.name }}</div><q-space /><q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <StatusBadge :status="selected.status" class="q-mb-md" />
          <div class="text-body2 q-mb-md">{{ selected.description }}</div>
          <div class="text-subtitle2 q-mb-sm">Разрешения</div>
          <q-list bordered separator class="q-mb-md">
            <q-item v-for="p in selected.permissions" :key="p.id">
              <q-item-section><q-item-label>{{ p.name }}</q-item-label><q-item-label caption>{{ p.description }}</q-item-label></q-item-section>
              <q-item-section side><q-toggle :model-value="p.granted" color="primary" @update:model-value="togglePerm(selected.id, p.id)" /></q-item-section>
            </q-item>
          </q-list>
          <div v-if="selected.commands.length" class="text-subtitle2 q-mb-sm">Команды</div>
          <q-list bordered separator class="q-mb-md">
            <q-item v-for="c in selected.commands" :key="c.id">
              <q-item-section><q-item-label>{{ c.name }}</q-item-label><q-item-label caption>{{ c.description }}</q-item-label><q-badge color="primary" outline class="q-mt-xs" flat>"{{ c.phrase }}"</q-badge></q-item-section>
              <q-item-section side><q-btn dense color="primary" icon="mic" label="Алиса" :disable="selected.status !== 'running'" @click="execAlice(c.phrase, selected.name)" /></q-item-section>
            </q-item>
          </q-list>
          <div class="row justify-between q-mt-md">
            <q-btn color="negative" flat icon="delete" label="Удалить" @click="remove(selected)" />
            <q-btn :color="selected.status === 'running' ? 'negative' : 'positive'" :label="selected.status === 'running' ? 'Остановить' : 'Запустить'" @click="toggle(selected)" />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="showAdd">
      <q-card style="min-width: 400px">
        <q-card-section><div class="text-h6">Добавить интеграцию</div></q-card-section>
        <q-card-section>
          <q-input v-model="newP.name" label="Название" outlined dense class="q-mb-md" />
          <q-input v-model="newP.url" label="URL / путь" outlined dense />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Отмена" v-close-popup />
          <q-btn color="primary" label="Добавить" :disable="!newP.name" @click="addProject" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <ConfirmDialog v-model="showConfirm" title="Удалить?" message="Все данные будут удалены." confirm-label="Удалить" :danger="true" @confirm="doRemove" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { mockIntegrations } from '@/data/alice-data.js';
import StatusBadge from './StatusBadge.vue';
import ConfirmDialog from './ConfirmDialog.vue';
const integrations = ref([...mockIntegrations]);
const selected = ref(null);
const showDetail = ref(false);
const showAdd = ref(false);
const showConfirm = ref(false);
const pendingRemove = ref(null);
const newP = ref({ name: '', url: '' });
const toggle = (i) => { const s = i.status === 'running' ? 'stopped' : 'running'; integrations.value = integrations.value.map(x => x.id === i.id ? {...x, status: s} : x); if (selected.value?.id === i.id) selected.value = {...selected.value, status: s}; };
const togglePerm = (iid, pid) => { const u = (x) => ({...x, permissions: x.permissions.map(p => p.id === pid ? {...p, granted: !p.granted} : p)}); integrations.value = integrations.value.map(x => x.id === iid ? u(x) : x); if (selected.value?.id === iid) selected.value = u(selected.value); };
const remove = (i) => { pendingRemove.value = i; showConfirm.value = true; };
const doRemove = () => { integrations.value = integrations.value.filter(x => x.id !== pendingRemove.value.id); showDetail.value = false; };
const addProject = () => { integrations.value.push({ id: 'i'+Date.now(), name: newP.value.name, version: '0.1.0', description: 'Новая интеграция', author: 'Пользователь', source: 'manual', status: 'stopped', icon: 'inventory_2', permissions: [], commands: [], history: [], installedAt: new Date().toISOString().split('T')[0] }); showAdd.value = false; newP.value = { name: '', url: '' }; };
const execAlice = (phrase, name) => { alert('Алиса выполняет: ' + phrase); };
</script>
