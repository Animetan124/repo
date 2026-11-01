<template>
  <div class="processes-tab">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-subtitle1 text-weight-medium">Мониторинг процессов</div>
      <q-btn flat dense icon="download" label="Экспорт" @click="exportLogs" />
    </div>

    <div class="row q-gutter-md q-mb-md">
      <div class="col-xs-12 col-sm-4">
        <q-card flat bordered><q-card-section>
          <div class="text-caption text-grey-6">Всего</div>
          <div class="text-h5 text-weight-bold">{{ stats.total }}</div>
        </q-card-section></q-card>
      </div>
      <div class="col-xs-12 col-sm-4">
        <q-card flat bordered><q-card-section>
          <div class="text-caption text-grey-6">Активных</div>
          <div class="text-h5 text-weight-bold text-positive">{{ stats.active }}</div>
        </q-card-section></q-card>
      </div>
      <div class="col-xs-12 col-sm-4">
        <q-card flat bordered><q-card-section>
          <div class="text-caption text-grey-6">С ошибками</div>
          <div class="text-h5 text-weight-bold text-negative">{{ stats.errors }}</div>
        </q-card-section></q-card>
      </div>
    </div>

    <div class="row q-gutter-sm q-mb-md">
      <q-input v-model="search" dense outlined placeholder="Поиск..." class="col">
        <template v-slot:prepend><q-icon name="search" /></template>
      </q-input>
      <q-select v-model="filterType" :options="typeOptions" dense outlined emit-value map-options style="min-width: 150px" />
      <q-select v-model="filterStatus" :options="statusOptions" dense outlined emit-value map-options style="min-width: 150px" />
    </div>

    <div class="row q-gutter-md">
      <div v-for="process in filteredProcesses" :key="process.id" class="col-xs-12 col-md-6">
        <q-card flat bordered class="cursor-pointer" @click="openDetail(process)">
          <q-card-section>
            <div class="row items-start no-wrap">
              <div class="col">
                <div class="row items-center q-mb-xs">
                  <q-icon :name="getTypeIcon(process.type)" size="20px" class="q-mr-sm" />
                  <div class="text-subtitle1 text-weight-medium">{{ process.name }}</div>
                </div>
                <div class="text-caption text-grey-6">{{ process.description }}</div>
              </div>
              <StatusBadge :status="process.status" size="sm" />
            </div>
            <div class="row q-gutter-sm q-mt-md">
              <div class="col bg-grey-2 rounded-borders q-pa-sm text-center">
                <div class="text-caption text-grey-6">CPU</div>
                <div class="text-weight-bold">{{ process.cpu }}%</div>
              </div>
              <div class="col bg-grey-2 rounded-borders q-pa-sm text-center">
                <div class="text-caption text-grey-6">Память</div>
                <div class="text-weight-bold">{{ process.memory }} МБ</div>
              </div>
              <div class="col bg-grey-2 rounded-borders q-pa-sm text-center">
                <div class="text-caption text-grey-6">Аптайм</div>
                <div class="text-weight-bold">{{ process.uptime }}</div>
              </div>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-actions>
            <q-btn flat dense label="Пауза" size="sm" @click.stop="confirmAction(process, 'pause')" />
            <q-btn flat dense label="Перезапуск" size="sm" color="primary" @click.stop="confirmAction(process, 'restart')" />
            <q-btn flat dense label="Остановить" size="sm" color="negative" @click.stop="confirmAction(process, 'stop')" />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="showDetail" maximized>
      <q-card v-if="selectedProcess">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ selectedProcess.name }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <div class="row items-center q-mb-md">
            <StatusBadge :status="selectedProcess.status" />
            <q-space />
            <div class="text-caption text-grey-6">Последнее: {{ selectedProcess.lastAction }}</div>
          </div>
          <div class="text-body2 q-mb-md">{{ selectedProcess.description }}</div>
          <div class="text-subtitle2 q-mb-sm">Разрешения</div>
          <div class="q-gutter-xs q-mb-md">
            <q-badge v-for="perm in selectedProcess.permissions" :key="perm" color="primary" outline class="q-mr-xs q-mb-xs">{{ perm }}</q-badge>
          </div>
          <div class="text-subtitle2 q-mb-sm">Журнал</div>
          <q-list bordered separator>
            <q-item v-for="(log, i) in selectedProcess.logs" :key="i" dense>
              <q-item-section side><q-badge :color="getLogColor(log.level)" :label="log.timestamp" /></q-item-section>
              <q-item-section><q-item-label>{{ log.message }}</q-item-label></q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>

    <ConfirmDialog v-model="showConfirm" :title="confirmTitle" :message="confirmMessage" @confirm="executeAction" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { mockProcesses } from '@/data/alice-data.js';
import StatusBadge from './StatusBadge.vue';
import ConfirmDialog from './ConfirmDialog.vue';

const processes = ref([...mockProcesses]);
const search = ref('');
const filterType = ref('all');
const filterStatus = ref('all');
const showDetail = ref(false);
const selectedProcess = ref(null);
const showConfirm = ref(false);
const confirmTitle = ref('');
const confirmMessage = ref('');
const pendingAction = ref(null);

const typeOptions = [
  { label: 'Все типы', value: 'all' },
  { label: 'Системные', value: 'system' },
  { label: 'Задачи', value: 'task' },
  { label: 'Устройства', value: 'device' },
  { label: 'Сервисы', value: 'service' },
  { label: 'Сущности', value: 'entity' },
];

const statusOptions = [
  { label: 'Все статусы', value: 'all' },
  { label: 'Активные', value: 'active' },
  { label: 'Остановленные', value: 'stopped' },
  { label: 'С ошибками', value: 'error' },
  { label: 'Требуют разрешения', value: 'permission_required' },
];

const stats = computed(() => ({
  total: processes.value.length,
  active: processes.value.filter(p => p.status === 'active').length,
  errors: processes.value.filter(p => p.status === 'error').length,
}));

const filteredProcesses = computed(() => {
  let result = [...processes.value];
  if (search.value) {
    const q = search.value.toLowerCase();
    result = result.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }
  if (filterType.value !== 'all') result = result.filter(p => p.type === filterType.value);
  if (filterStatus.value !== 'all') result = result.filter(p => p.status === filterStatus.value);
  return result;
});

const getTypeIcon = (type) => {
  const icons = { system: 'settings', task: 'assignment', device: 'devices', service: 'cloud', entity: 'extension' };
  return icons[type] || 'help';
};

const getLogColor = (level) => {
  const colors = { info: 'primary', warning: 'warning', error: 'negative' };
  return colors[level] || 'grey';
};

const openDetail = (process) => { selectedProcess.value = process; showDetail.value = true; };

const confirmAction = (process, action) => {
  const labels = { pause: 'приостановить', restart: 'перезапустить', stop: 'отключить' };
  confirmTitle.value = ${labels[action]} процесс?;
  confirmMessage.value = Вы уверены, что хотите  процесс ""?;
  pendingAction.value = { process, action };
  showConfirm.value = true;
};

const executeAction = () => {
  if (!pendingAction.value) return;
  const { process, action } = pendingAction.value;
  processes.value = processes.value.map(p => {
    if (p.id !== process.id) return p;
    if (action === 'stop') return { ...p, status: 'stopped', cpu: 0, memory: 0 };
    if (action === 'restart') return { ...p, status: 'active', errors: 0 };
    return { ...p, status: 'stopped' };
  });
  pendingAction.value = null;
};

const exportLogs = () => {
  const data = JSON.stringify(processes.value.flatMap(p => p.logs.map(l => ({ process: p.name, ...l }))), null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'alice-logs.json'; a.click();
  URL.revokeObjectURL(url);
};
</script>
