<template>
  <q-badge :color="statusColor" class="status-badge" :class="{ 'status-badge--sm': size === 'sm' }">
    <span class="status-dot" :class="{ 'status-dot--pulse': isPulsing }" />
    {{ statusLabel }}
  </q-badge>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps({
  status: { type: String, required: true },
  size: { type: String, default: 'md' },
});
const statusConfig = {
  active: { label: 'Активно', color: 'positive', pulse: true },
  running: { label: 'Работает', color: 'positive', pulse: true },
  stopped: { label: 'Остановлено', color: 'grey-6', pulse: false },
  error: { label: 'Ошибка', color: 'negative', pulse: false },
  permission_required: { label: 'Требует разрешения', color: 'warning', pulse: false },
  installing: { label: 'Установка', color: 'info', pulse: true },
};
const statusColor = computed(() => statusConfig[props.status]?.color || 'grey');
const statusLabel = computed(() => statusConfig[props.status]?.label || props.status);
const isPulsing = computed(() => statusConfig[props.status]?.pulse || false);
</script>

<style scoped>
.status-badge { padding: 4px 12px; font-size: 12px; font-weight: 500; border-radius: 12px; display: inline-flex; align-items: center; gap: 6px; }
.status-badge--sm { padding: 2px 8px; font-size: 11px; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
.status-dot--pulse { animation: pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
</style>
