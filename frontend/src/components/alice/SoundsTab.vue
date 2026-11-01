<template>
  <div>
    <div class="row items-center justify-between q-mb-md">
      <div class="text-subtitle1 text-weight-medium">Звуки</div>
      <div>
        <q-btn flat dense icon="restart_alt" label="Сбросить" class="q-mr-sm" @click="reset" />
        <q-btn dense icon="upload_file" label="Загрузить" color="primary" @click="showUpload = true" />
      </div>
    </div>
    <div class="row q-gutter-md q-mb-md">
      <div class="col-xs-6 col-sm-3"><q-card flat bordered><q-card-section><div class="text-caption text-grey-6">Всего</div><div class="text-h5 text-weight-bold">{{ sounds.length }}</div></q-card-section></q-card></div>
      <div class="col-xs-6 col-sm-3"><q-card flat bordered><q-card-section><div class="text-caption text-grey-6">Активных</div><div class="text-h5 text-weight-bold text-positive">{{ sounds.filter(s=>s.enabled).length }}</div></q-card-section></q-card></div>
      <div class="col-xs-6 col-sm-3"><q-card flat bordered><q-card-section><div class="text-caption text-grey-6">Своих</div><div class="text-h5 text-weight-bold text-primary">{{ sounds.filter(s=>s.isCustom).length }}</div></q-card-section></q-card></div>
      <div class="col-xs-6 col-sm-3"><q-card flat bordered><q-card-section><div class="text-caption text-grey-6">Категорий</div><div class="text-h5 text-weight-bold text-info">{{ categories.length }}</div></q-card-section></q-card></div>
    </div>
    <div class="row q-gutter-sm q-mb-md">
      <q-input v-model="search" dense outlined placeholder="Поиск..." class="col"><template v-slot:prepend><q-icon name="search" /></template></q-input>
      <q-select v-model="filterCat" :options="catOptions" dense outlined emit-value map-options style="min-width: 180px" />
    </div>
    <div v-for="(items, cat) in grouped" :key="cat" class="q-mb-lg">
      <div class="text-subtitle2 text-grey-6 q-mb-sm">{{ cat }} ({{ items.length }})</div>
      <q-list bordered separator>
        <q-item v-for="s in items" :key="s.id" :class="{ 'bg-blue-1': playingId === s.id }">
          <q-item-section side><q-btn round dense :icon="playingId === s.id ? 'pause' : 'play_arrow'" :color="playingId === s.id ? 'primary' : 'grey-7'" :disable="!s.enabled" @click="play(s)" /></q-item-section>
          <q-item-section>
            <q-item-label>{{ s.name }}<q-badge v-if="s.isCustom" color="primary" outline class="q-ml-sm" flat>Свой</q-badge></q-item-label>
            <q-item-label caption>{{ s.format }} · {{ s.duration }} · {{ s.size }}</q-item-label>
          </q-item-section>
          <q-item-section side class="gt-xs">
            <div class="row items-center q-gutter-sm">
              <q-slider :model-value="s.volume" @update:model-value="v => setVol(s.id, v)" :disable="!s.enabled" :min="0" :max="100" color="primary" style="width: 100px" />
              <div class="text-caption" style="width: 32px">{{ s.volume }}%</div>
            </div>
          </q-item-section>
          <q-item-section side><q-toggle :model-value="s.enabled" color="primary" @update:model-value="toggle(s.id)" /></q-item-section>
        </q-item>
      </q-list>
    </div>
    <q-dialog v-model="showUpload">
      <q-card style="min-width: 400px">
        <q-card-section><div class="text-h6">Загрузить звук</div></q-card-section>
        <q-card-section>
          <div class="text-center q-pa-xl cursor-pointer" style="border: 2px dashed #ccc; border-radius: 12px" @click="$refs.fileInput.click()">
            <q-icon name="cloud_upload" size="48px" color="grey-5" />
            <div class="q-mt-sm">Нажмите для выбора файла</div>
            <div class="text-caption text-grey-6">MP3, WAV, OGG</div>
          </div>
          <input ref="fileInput" type="file" accept=".mp3,.wav,.ogg" style="display:none" @change="handleUpload" />
        </q-card-section>
        <q-card-actions align="right"><q-btn flat label="Закрыть" v-close-popup /></q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { mockSounds } from '@/data/alice-data.js';
const sounds = ref([...mockSounds]);
const search = ref('');
const filterCat = ref('all');
const playingId = ref(null);
const showUpload = ref(false);
const categories = computed(() => [...new Set(sounds.value.map(s => s.category))]);
const catOptions = computed(() => [{ label: 'Все', value: 'all' }, ...categories.value.map(c => ({ label: c, value: c }))]);
const filtered = computed(() => { let r = [...sounds.value]; if (search.value) { const q = search.value.toLowerCase(); r = r.filter(s => s.name.toLowerCase().includes(q)); } if (filterCat.value !== 'all') r = r.filter(s => s.category === filterCat.value); return r; });
const grouped = computed(() => { const g = {}; filtered.value.forEach(s => { if (!g[s.category]) g[s.category] = []; g[s.category].push(s); }); return g; });
const play = (s) => { if (playingId.value === s.id) { playingId.value = null; return; } try { const ctx = new AudioContext(); const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.connect(gain); gain.connect(ctx.destination); osc.frequency.value = 440; gain.gain.value = (s.volume/100)*0.3; osc.start(); playingId.value = s.id; setTimeout(() => { osc.stop(); ctx.close(); playingId.value = null; }, 1500); } catch { playingId.value = null; } };
const toggle = (id) => { sounds.value = sounds.value.map(s => s.id === id ? {...s, enabled: !s.enabled} : s); };
const setVol = (id, v) => { sounds.value = sounds.value.map(s => s.id === id ? {...s, volume: v} : s); };
const reset = () => { sounds.value = [...mockSounds]; };
const handleUpload = (e) => { const f = e.target.files[0]; if (!f) return; sounds.value.push({ id: 's'+Date.now(), name: f.name.replace(/\.[^.]+$/,''), category: 'Пользовательские', format: f.name.split('.').pop().toUpperCase(), duration: '0:00', size: Math.round(f.size/1024)+' КБ', enabled: true, volume: 80, isCustom: true }); showUpload.value = false; };
</script>
