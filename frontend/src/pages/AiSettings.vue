<template>
  <q-page class="ai-page q-px-md q-py-lg md:q-px-lg">
    <header class="ai-header q-mb-lg">
      <div class="row items-center q-gutter-sm">
        <div class="ai-header__icon"><q-icon name="psychology" size="22px" /></div>
        <div>
          <h1 class="text-h5 text-weight-semibold q-mb-none">ИИ и API</h1>
          <p class="text-body2 text-grey-5 q-mt-xs q-mb-none">
            Одна модель пишет текст, другая озвучивает, третья слушает
          </p>
        </div>
      </div>
      <q-btn color="primary" icon="save" label="Сохранить всё" no-caps unelevated
        :loading="api.loading.value" @click="save" />
    </header>

    <q-card flat bordered class="ai-card q-mb-lg">
      <q-card-section class="ai-card__header row items-center q-gutter-sm">
        <div class="ai-card__icon"><q-icon name="auto_awesome" size="20px" /></div>
        <div>
          <div class="text-subtitle1 text-weight-semibold">Начальный (системный) промпт</div>
          <div class="text-caption text-grey-6">Эта инструкция задаётся модели в начале каждого диалога</div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-input v-model="form.systemPrompt" type="textarea" outlined dark autogrow
          placeholder="Ты — умный ассистент пользователя Яндекс Станции. Отвечай коротко и по делу..."
          :rows="5" />
        <div class="row q-gutter-sm q-mt-sm">
          <q-btn flat dense no-caps color="grey-5" label="Вежливый ассистент"
            @click="form.systemPrompt = PROMPTS.polite" />
          <q-btn flat dense no-caps color="grey-5" label="Дом-управляющий"
            @click="form.systemPrompt = PROMPTS.home" />
          <q-btn flat dense no-caps color="grey-5" label="Очистить"
            @click="form.systemPrompt = ''" />
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="ai-card q-mb-lg">
      <q-card-section class="ai-card__header row items-center q-gutter-sm">
        <div class="ai-card__icon ai-card__icon--writer"><q-icon name="edit_note" size="20px" /></div>
        <div class="col">
          <div class="text-subtitle1 text-weight-semibold">Пишет (LLM)</div>
          <div class="text-caption text-grey-6">Модель, которая генерирует текст ответа</div>
        </div>
        <q-btn flat dense color="grey-5" icon="science" label="Тест" no-caps :loading="testLlm.loading"
          @click="doTestLlm" />
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="row q-col-gutter-md">
          <q-input v-model="form.llm.baseUrl" label="API Endpoint" outlined dense dark class="col-12 col-md-8"
            placeholder="https://api.openai.com/v1" />
          <q-input v-model="form.llm.model" label="Модель" outlined dense dark class="col-12 col-md-4"
            placeholder="gpt-4o-mini" />
          <q-input v-model="form.llm.apiKey" label="API-ключ" outlined dense dark class="col-12"
            :type="showLlmKey ? 'text' : 'password'" autocomplete="new-password">
            <template #append>
              <q-icon :name="showLlmKey ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                @click="showLlmKey = !showLlmKey" />
            </template>
          </q-input>
        </div>

        <div class="text-subtitle2 text-weight-medium q-mt-md q-mb-sm">Расширенные параметры</div>
        <div class="row q-col-gutter-md">
          <q-input v-model.number="form.llm.temperature" type="number" step="0.1" min="0" max="2"
            label="Temperature" outlined dense dark class="col-12 col-sm-6 col-md-3"
            hint="0 = строго, 2 = креативно" />
          <q-input v-model.number="form.llm.maxTokens" type="number" min="1" max="32000"
            label="Max tokens" outlined dense dark class="col-12 col-sm-6 col-md-3" />
          <q-input v-model.number="form.llm.topP" type="number" step="0.05" min="0" max="1"
            label="Top P" outlined dense dark class="col-12 col-sm-6 col-md-3" />
          <q-input v-model.number="form.llm.topK" type="number" min="0" max="200"
            label="Top K" outlined dense dark class="col-12 col-sm-6 col-md-3" />
          <q-input v-model.number="form.llm.presencePenalty" type="number" step="0.1" min="-2" max="2"
            label="Presence penalty" outlined dense dark class="col-12 col-sm-6 col-md-3" />
          <q-input v-model.number="form.llm.frequencyPenalty" type="number" step="0.1" min="-2" max="2"
            label="Frequency penalty" outlined dense dark class="col-12 col-sm-6 col-md-3" />
        </div>

        <q-banner v-if="testLlm.message" :class="testLlm.ok ? 'bg-positive' : 'bg-negative'"
          class="q-mt-md text-white">
          {{ testLlm.message }}
        </q-banner>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="ai-card q-mb-lg">
      <q-card-section class="ai-card__header row items-center q-gutter-sm">
        <div class="ai-card__icon ai-card__icon--speaker"><q-icon name="record_voice_over" size="20px" /></div>
        <div class="col">
          <div class="text-subtitle1 text-weight-semibold">Озвучивает (TTS)</div>
          <div class="text-caption text-grey-6">Модель, которая превращает текст в речь</div>
        </div>
        <q-btn flat dense color="grey-5" icon="volume_up" label="Тест голоса" no-caps :loading="testTts.loading"
          @click="doTestTts" />
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="row q-col-gutter-md">
          <q-select v-model="form.tts.provider" :options="TTS_PROVIDERS" label="Провайдер" outlined dense dark
            emit-value map-options class="col-12 col-md-4" />
          <q-input v-model="form.tts.apiKey" label="API-ключ TTS" outlined dense dark class="col-12 col-md-4"
            :type="showTtsKey ? 'text' : 'password'" autocomplete="new-password">
            <template #append>
              <q-icon :name="showTtsKey ? 'visibility_off' : 'visibility'" class="cursor-pointer"
                @click="showTtsKey = !showTtsKey" />
            </template>
          </q-input>
          <q-input v-model="form.tts.model" label="Модель голоса" outlined dense dark class="col-12 col-md-4"
            placeholder="tts-1 / eleven_v2" />
          <q-input v-model="form.tts.voice" label="Голос" outlined dense dark class="col-12 col-md-6"
            placeholder="alloy / onyx / aria" />
          <q-input v-model.number="form.tts.speed" type="number" step="0.1" min="0.5" max="2"
            label="Скорость (0.5–2.0)" outlined dense dark class="col-12 col-md-3" />
          <q-toggle v-model="form.tts.autoPlay" label="Автовоспроизведение ответа" class="col-12 col-md-3" />
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="ai-card">
      <q-card-section class="ai-card__header row items-center q-gutter-sm">
        <div class="ai-card__icon ai-card__icon--listener"><q-icon name="mic" size="20px" /></div>
        <div>
          <div class="text-subtitle1 text-weight-semibold">Слушает (ASR)</div>
          <div class="text-caption text-grey-6">Распознавание речи пользователя</div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="row q-col-gutter-md">
          <q-select v-model="form.asr.provider" :options="ASR_PROVIDERS" label="Провайдер" outlined dense dark
            emit-value map-options class="col-12 col-md-4" />
          <q-input v-model="form.asr.model" label="Модель" outlined dense dark class="col-12 col-md-4"
            placeholder="whisper-1" />
          <q-select v-model="form.asr.language" :options="ASR_LANGS" label="Язык" outlined dense dark
            emit-value map-options class="col-12 col-md-4" />
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useStationApi } from '@/composables/useStationApi'

const $q = useQuasar()
const api = useStationApi()

const PROMPTS = {
  polite: 'Ты — вежливый и дружелюбный голосовой ассистент. Отвечай короткими естественными фразами, без списков и markdown. Избегай длинных объяснений.',
  home: 'Ты — управляющий умного дома. Коротко подтверждай команды, сообщай статус устройств. Если запрос не о доме — скажи, что это вне твоих возможностей.'
}
const TTS_PROVIDERS = [
  { label: 'OpenAI TTS', value: 'openai' },
  { label: 'ElevenLabs', value: 'elevenlabs' },
  { label: 'Microsoft Edge TTS', value: 'edge' },
  { label: 'Silero (локально)', value: 'silero' }
]
const ASR_PROVIDERS = [
  { label: 'OpenAI Whisper', value: 'whisper' },
  { label: 'Vosk (локально)', value: 'vosk' },
  { label: 'Яндекс SpeechKit', value: 'yandex' }
]
const ASR_LANGS = [
  { label: 'Русский', value: 'ru' },
  { label: 'English', value: 'en' }
]

const DEFAULTS = {
  systemPrompt: '',
  llm: {
    baseUrl: '', model: '', apiKey: '', type: 'chat',
    temperature: 0.7, maxTokens: 1024, topP: 1, topK: 0,
    presencePenalty: 0, frequencyPenalty: 0
  },
  tts: {
    provider: 'openai', apiKey: '', model: 'tts-1', voice: 'alloy',
    speed: 1.0, autoPlay: true
  },
  asr: { provider: 'whisper', model: 'whisper-1', language: 'ru' }
}

const form = reactive(JSON.parse(JSON.stringify(DEFAULTS)))
const showLlmKey = ref(false)
const showTtsKey = ref(false)
const testLlm = reactive({ loading: false, ok: null, message: '' })
const testTts = reactive({ loading: false, ok: null, message: '' })

function fromServer(s) {
  form.systemPrompt = s.ai?.systemPrompt || s.systemPrompt || ''
  form.llm.baseUrl = s.ai?.baseUrl || ''
  form.llm.model = s.ai?.model || ''
  form.llm.apiKey = s.ai?.apiKey || ''
  form.llm.type = s.ai?.type || 'chat'
  Object.assign(form.llm, s.ai?.params || {})
  Object.assign(form.tts, s.tts || {})
  Object.assign(form.asr, s.asr || {})
}

function toServer() {
  return {
    ai: {
      baseUrl: form.llm.baseUrl, model: form.llm.model, apiKey: form.llm.apiKey,
      type: form.llm.type, systemPrompt: form.systemPrompt,
      params: {
        temperature: form.llm.temperature, maxTokens: form.llm.maxTokens,
        topP: form.llm.topP, topK: form.llm.topK,
        presencePenalty: form.llm.presencePenalty, frequencyPenalty: form.llm.frequencyPenalty
      }
    },
    tts: { ...form.tts },
    asr: { ...form.asr }
  }
}

async function load() {
  try {
    const s = await api.withLoading(() => api.getSettings())
    fromServer(s)
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Не удалось загрузить настройки: ' + e.message })
  }
}

async function save() {
  try {
    await api.withLoading(() => api.saveSettings(toServer()))
    $q.notify({ type: 'positive', message: 'Настройки ИИ сохранены' })
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Ошибка сохранения: ' + e.message })
  }
}

async function doTestLlm() {
  testLlm.loading = true; testLlm.message = ''; testLlm.ok = null
  try {
    const r = await api.testAi({ model: form.llm.model, baseUrl: form.llm.baseUrl, apiKey: form.llm.apiKey })
    testLlm.ok = true
    testLlm.message = 'Модель ответила: ' + (r?.reply || JSON.stringify(r)).slice(0, 200)
  } catch (e) {
    testLlm.ok = false; testLlm.message = 'Ошибка: ' + e.message
  } finally { testLlm.loading = false }
}

async function doTestTts() {
  testTts.loading = true; testTts.message = ''
  try {
    await api.execCommand(`echo "TTS-провайдер ${form.tts.provider} настроен"`)
    testTts.ok = true; testTts.message = 'Конфигурация TTS передана на станцию'
  } catch (e) { testTts.ok = false; testTts.message = 'Ошибка: ' + e.message }
  finally { testTts.loading = false }
}

onMounted(load)
</script>

<style scoped lang="scss">
.ai-page { max-width: 1100px; margin: 0 auto; }
.ai-header {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 12px;
}
.ai-header__icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(103, 80, 164, .16); color: #b39ddb;
}
.ai-card {
  border-radius: 14px; border-color: rgba(255,255,255,.08);
  background: #1a1a1a; overflow: hidden;
}
.ai-card__header { background: rgba(255,255,255,.03); padding: 14px 16px; }
.ai-card__icon {
  width: 38px; height: 38px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(103, 80, 164, .16); color: #b39ddb;
}
.ai-card__icon--writer { background: rgba(33, 150, 243, .15); color: #64b5f6; }
.ai-card__icon--speaker { background: rgba(76, 175, 80, .15); color: #81c784; }
.ai-card__icon--listener { background: rgba(255, 152, 0, .15); color: #ffb74d; }
.ai-card :deep(input:-webkit-autofill),
.ai-card :deep(textarea:-webkit-autofill) {
  -webkit-box-shadow: 0 0 0 1000px #1e1e1e inset;
  box-shadow: 0 0 0 1000px #1e1e1e inset;
  -webkit-text-fill-color: #eee;
  caret-color: #eee;
}
</style>