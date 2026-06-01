<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { ChatMessage, SceneInfo, CharacterInfo } from '../../types/chat'
import ScenePanel from '../panels/ScenePanel.vue'
import MessageList from './MessageList.vue'
import InputBar from './InputBar.vue'
import { useAutoScroll } from '../../composables/useChat'

const props = defineProps<{
  messages: ChatMessage[]
  scene: SceneInfo
  character: CharacterInfo
  isTyping: boolean
  canSend: boolean
  error: string | null
}>()

const emit = defineEmits<{
  send: [text: string]
  selectAction: [payload: { messageId: string; suggestionId: string; action: string }]
}>()

const scrollRef = ref<HTMLElement | null>(null)
const { scrollToBottom, onScroll } = useAutoScroll(scrollRef)

watch(() => props.messages, () => scrollToBottom(), { deep: true })
watch(() => props.isTyping, () => scrollToBottom())

onMounted(() => scrollToBottom(false))
</script>

<template>
  <div class="chat-view">
    <ScenePanel :scene="scene" />
    <div ref="scrollRef" class="messages-scroll" @scroll="onScroll">
      <MessageList
        :messages="messages"
        :is-typing="isTyping"
        @select-action="emit('selectAction', $event)"
      />
    </div>
    <InputBar :disabled="!canSend" :error="error" @send="emit('send', $event)" />
  </div>
</template>

<style scoped>
.chat-view {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.messages-scroll {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}
</style>
