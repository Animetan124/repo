
<template>
  <q-page padding>
    <div class="text-h4 text-weight-medium q-mb-sm">
      {{ title }}
    </div>

    <div class="text-body1 text-grey-7 q-mb-lg">
      {{ description }}
    </div>

    <q-card flat bordered class="q-pa-lg">
      <div class="row items-center q-gutter-md">
        <q-icon name="construction" size="36px" color="primary" />
        <div>
          <div class="text-h6">Раздел подготавливается</div>
          <div class="text-body2 text-grey-7">
            Здесь появится управление соответствующей функцией станции.
          </div>
        </div>
      </div>
    </q-card>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const title = computed(() => route.meta.title || 'Раздел')
const description = computed(() => route.meta.description || '')
</script>
