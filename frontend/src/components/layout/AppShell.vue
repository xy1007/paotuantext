<script setup lang="ts">
import { ref } from 'vue'
import type { ThemeConfig, ChatMessage, SceneInfo, CharacterInfo, StatusTag } from '../../types/chat'
import type { CampaignStatLabels } from '../../campaigns/types'
import type { SaveSlotMeta } from '../../types/save'
import TopBar from './TopBar.vue'
import ChatView from '../chat/ChatView.vue'
import SideSheet from '../panels/SideSheet.vue'
import CharacterPanel from '../panels/CharacterPanel.vue'
import SaveSheet from '../panels/SaveSheet.vue'

defineProps<{
  theme: ThemeConfig
  messages: ChatMessage[]
  scene: SceneInfo
  character: CharacterInfo
  statuses: StatusTag[]
  clues: string[]
  isTyping: boolean
  canSend: boolean
  error: string | null
  statLabels: CampaignStatLabels
  saveSlots: SaveSlotMeta[]
  saveLoading: boolean
  saveBusy: boolean
  canSaveGame: boolean
  saveStatusMessage: string | null
}>()

const emit = defineEmits<{
  send: [text: string]
  selectAction: [payload: { messageId: string; suggestionId: string; action: string }]
  saveRefresh: []
  saveToSlot: [slot: number]
  loadFromSlot: [slot: number]
  deleteSlot: [slot: number]
}>()

const sheetOpen = ref(false)
const saveOpen = ref(false)
</script>

<template>
  <div class="app-shell">
    <TopBar :title="scene.title || theme.name" @menu="sheetOpen = true" @save="saveOpen = true" />
    <ChatView
      :messages="messages"
      :scene="scene"
      :character="character"
      :is-typing="isTyping"
      :can-send="canSend"
      :error="error"
      @send="emit('send', $event)"
      @select-action="emit('selectAction', $event)"
    />
    <SideSheet :open="sheetOpen" @close="sheetOpen = false">
      <CharacterPanel
        :character="character"
        :stat-labels="statLabels"
        :statuses="statuses"
        :clues="clues"
      />
    </SideSheet>
    <SaveSheet
      :open="saveOpen"
      :slots="saveSlots"
      :loading="saveLoading"
      :busy="saveBusy"
      :can-save="canSaveGame"
      :status-message="saveStatusMessage"
      @close="saveOpen = false"
      @refresh="emit('saveRefresh')"
      @save="emit('saveToSlot', $event)"
      @load="emit('loadFromSlot', $event)"
      @delete="emit('deleteSlot', $event)"
    />
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 480px;
  margin: 0 auto;
  background: var(--bg);
}
</style>
