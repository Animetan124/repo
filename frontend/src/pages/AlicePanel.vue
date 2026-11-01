<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="text-h4 text-weight-bold"><q-icon name="smart_toy" size="32px" class="q-mr-sm text-primary" />Алиса</div>
        <div class="text-subtitle1 text-grey-6 q-mt-xs">Панель управления голосовым ассистентом</div>
      </div>
    </div>
    <q-card flat bordered style="border-radius: 12px">
      <q-tabs v-model="tab" dense class="text-grey-7" active-color="primary" indicator-color="primary" align="left" narrow-indicator>
        <q-tab name="processes" icon="bolt" label="Процессы" />
        <q-tab name="integrations" icon="electrical_services" label="Интеграции" />
        <q-tab name="sounds" icon="volume_up" label="Звуки" />
      </q-tabs>
      <q-separator />
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="processes"><ProcessesTab /></q-tab-panel>
        <q-tab-panel name="integrations"><IntegrationsTab /></q-tab-panel>
        <q-tab-panel name="sounds"><SoundsTab /></q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import ProcessesTab from '@/components/alice/ProcessesTab.vue';
import IntegrationsTab from '@/components/alice/IntegrationsTab.vue';
import SoundsTab from '@/components/alice/SoundsTab.vue';
const tab = ref('processes');
</script>
