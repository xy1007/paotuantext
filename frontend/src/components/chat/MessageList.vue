<script setup lang="ts">
import { computed } from 'vue'
import type { ChatMessage } from '../../types/chat'
import MessageBubble from './MessageBubble.vue'

const props = defineProps<{
  messages: ChatMessage[]
  isTyping: boolean
}>()

const emit = defineEmits<{
  selectAction: [payload: { messageId: string; suggestionId: string; action: string }]
}>()

const showTyping = computed(
  () => props.isTyping && !props.messages.some((m) => m.streaming),
)

/** 仅当最新待回复的 DM 消息（其后尚无玩家发言）可点击建议 */
const pendingSuggestionMessageId = computed(() => {
  for (let i = props.messages.length - 1; i >= 0; i--) {
    const m = props.messages[i]
    if (m.role === 'player') return null
    if (
      !m.streaming &&
      (m.role === 'dm' || m.role === 'system') &&
      (m.suggestions?.length ?? 0) > 0 &&
      !m.chosenSuggestionId
    ) {
      return m.id
    }
  }
  return null
})
</script>

<template>
  <div class="message-list">
    <MessageBubble
      v-for="msg in messages"
      :key="msg.id"
      :message="msg"
      :suggestions-enabled="msg.id === pendingSuggestionMessageId"
      @select-action="emit('selectAction', $event)"
    />
    <div v-if="showTyping" class="typing-indicator">
      <span class="dot" />
      <span class="dot" />
      <span class="dot" />
      <span class="typing-text">KP 正在叙述…</span>
    </div>
  </div>
</template>

<style scoped>
.message-list {
  padding: 12px 0 8px;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent-dim);
  animation: bounce 1.2s ease-in-out infinite;
}

.dot:nth-child(2) {
  animation-delay: 0.15s;
}

.dot:nth-child(3) {
  animation-delay: 0.3s;
}

.typing-text {
  font-size: 12px;
  color: var(--text-dim);
  margin-left: 4px;
}

@keyframes bounce {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-4px);
    opacity: 1;
  }
}
</style>
