<script setup lang="ts">
import { computed } from 'vue'
import type { ChatMessage } from '../../types/chat'
import ActionChips from './ActionChips.vue'

const props = defineProps<{
  message: ChatMessage
  suggestionsEnabled?: boolean
}>()

const emit = defineEmits<{
  selectAction: [payload: { messageId: string; suggestionId: string; action: string }]
}>()

const roleLabel = computed(() => {
  const labels: Record<string, string> = {
    narrator: '叙述',
    dm: 'KP',
    player: '你',
    system: '系统',
    dice: '检定',
  }
  return labels[props.message.role] ?? ''
})

const showSuggestions = computed(
  () =>
    (props.message.suggestions?.length ?? 0) > 0 &&
    (props.message.role === 'dm' || props.message.role === 'system'),
)

const chipsEnabled = computed(
  () => Boolean(props.suggestionsEnabled) && !props.message.chosenSuggestionId,
)
</script>

<template>
  <article class="bubble-wrap" :class="message.role">
    <div class="bubble-col">
      <div class="bubble">
        <span v-if="message.role !== 'system' && message.role !== 'dice'" class="role-tag">
          {{ roleLabel }}
        </span>
        <p class="content">
          {{ message.content }}<span v-if="message.streaming" class="cursor">▍</span>
        </p>
      </div>
      <ActionChips
        v-if="showSuggestions"
        :suggestions="message.suggestions!"
        :enabled="chipsEnabled"
        :chosen-suggestion-id="message.chosenSuggestionId"
        @select="
          (suggestionId, action) =>
            emit('selectAction', { messageId: message.id, suggestionId, action })
        "
      />
    </div>
  </article>
</template>

<style scoped>
.bubble-wrap {
  display: flex;
  margin-bottom: 12px;
  padding: 0 14px;
}

.bubble-col {
  max-width: 88%;
  display: flex;
  flex-direction: column;
}

.bubble-wrap.narrator {
  justify-content: center;
}

.bubble-wrap.narrator .bubble-col {
  max-width: 95%;
}

.bubble-wrap.dm {
  justify-content: flex-start;
}

.bubble-wrap.player {
  justify-content: flex-end;
}

.bubble-wrap.player .bubble-col {
  align-items: flex-end;
}

.bubble-wrap.system,
.bubble-wrap.dice {
  justify-content: center;
}

.bubble-wrap.system .bubble-col,
.bubble-wrap.dice .bubble-col {
  max-width: 100%;
}

.bubble {
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid transparent;
}

.narrator .bubble {
  background: var(--bubble-narrator-bg);
  border-color: var(--bubble-narrator-border);
  border-radius: 4px;
  text-align: center;
}

.narrator .content {
  font-family: var(--font-narrative);
  font-size: 15px;
  line-height: 1.75;
  color: var(--text);
}

.dm .bubble {
  background: var(--bubble-dm-bg);
  border-color: var(--bubble-dm-border);
  border-bottom-left-radius: 4px;
}

.player .bubble {
  background: var(--bubble-player-bg);
  border-color: var(--bubble-player-border);
  border-bottom-right-radius: 4px;
}

.system .bubble {
  background: var(--bubble-system-bg);
  border: none;
  padding: 6px 12px;
}

.dice .bubble {
  background: var(--bubble-dice-bg);
  border: 1px dashed var(--accent-dim);
  padding: 6px 16px;
}

.dice .content {
  color: var(--bubble-dice-text);
  font-size: 13px;
  font-weight: 500;
  text-align: center;
}

.system .content {
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
}

.role-tag {
  display: block;
  font-size: 11px;
  color: var(--text-dim);
  margin-bottom: 4px;
  letter-spacing: 0.05em;
}

.player .role-tag {
  text-align: right;
  color: var(--accent-dim);
}

.dm .role-tag {
  color: #6a8ab0;
}

.content {
  font-size: 14px;
  line-height: 1.65;
  white-space: pre-wrap;
  word-break: break-word;
}

.cursor {
  animation: blink 0.8s step-end infinite;
  color: var(--accent);
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}
</style>
