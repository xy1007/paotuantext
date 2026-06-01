<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

const props = defineProps<{
  disabled?: boolean
  error?: string | null
}>()

const emit = defineEmits<{
  send: [text: string]
}>()

const input = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

function autoResize() {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, 120)}px`
}

watch(input, () => nextTick(autoResize))

function submit() {
  if (!input.value.trim() || props.disabled) return
  emit('send', input.value)
  input.value = ''
  nextTick(autoResize)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    submit()
  }
}
</script>

<template>
  <footer class="input-bar">
    <div v-if="error" class="error-banner">{{ error }}</div>
    <div class="input-row">
      <textarea
        ref="textareaRef"
        v-model="input"
        class="input"
        placeholder="输入你的行动..."
        rows="1"
        :disabled="disabled"
        @keydown="onKeydown"
        @input="autoResize"
      />
      <button class="send-btn" :disabled="disabled || !input.trim()" @click="submit">
        发送
      </button>
    </div>
  </footer>
</template>

<style scoped>
.input-bar {
  flex-shrink: 0;
  background: var(--bg-elevated);
  border-top: 1px solid var(--border);
  padding: 8px 12px;
  padding-bottom: calc(8px + env(safe-area-inset-bottom, 0));
}

.error-banner {
  font-size: 12px;
  color: #c97070;
  padding: 4px 4px 8px;
  line-height: 1.4;
}

.input-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.input {
  flex: 1;
  resize: none;
  padding: 10px 14px;
  border-radius: 20px;
  border: 1px solid var(--input-border);
  background: var(--input-bg);
  color: var(--text);
  line-height: 1.4;
  max-height: 120px;
  outline: none;
}

.input:focus {
  border-color: var(--accent-dim);
}

.input:disabled {
  opacity: 0.6;
}

.send-btn {
  flex-shrink: 0;
  padding: 10px 18px;
  border-radius: 20px;
  background: var(--accent);
  color: #1a1510;
  font-weight: 600;
  font-size: 14px;
}

.send-btn:disabled {
  opacity: 0.4;
}

.send-btn:active:not(:disabled) {
  filter: brightness(0.9);
}
</style>
