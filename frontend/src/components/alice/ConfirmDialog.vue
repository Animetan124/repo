<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card class="confirm-dialog" style="min-width: 350px">
      <q-card-section class="row items-center q-pb-none">
        <q-icon :name="danger ? 'warning' : 'info'" :color="danger ? 'negative' : 'primary'" size="24px" class="q-mr-sm" />
        <div class="text-h6">{{ title }}</div>
      </q-card-section>
      <q-card-section class="q-pt-md">
        <div class="text-body1">{{ message }}</div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Отмена" color="grey-7" v-close-popup />
        <q-btn :label="confirmLabel || 'Подтвердить'" :color="danger ? 'negative' : 'primary'" @click="onConfirm" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps({
  modelValue: Boolean,
  title: { type: String, required: true },
  message: { type: String, required: true },
  confirmLabel: { type: String, default: 'Подтвердить' },
  danger: { type: Boolean, default: false },
});
const emit = defineEmits(['update:modelValue', 'confirm']);
const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});
const onConfirm = () => { emit('confirm'); emit('update:modelValue', false); };
</script>

<style scoped>
.confirm-dialog { border-radius: 12px; }
</style>
