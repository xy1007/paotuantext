<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { darkwaterLakeTheme } from './styles/themes/darkwater-lake'
import { useTheme } from './composables/useTheme'
import { useChat } from './composables/useChat'
import { useSaveGame } from './composables/useSaveGame'
import AppShell from './components/layout/AppShell.vue'
import CampaignSelect from './components/game/CampaignSelect.vue'
import CharacterSelect from './components/game/CharacterSelect.vue'

const themeRef = ref(darkwaterLakeTheme)
useTheme(themeRef)

const chat = useChat()
const {
  phase,
  campaigns,
  theme,
  introNarrator,
  investigators,
  selectPrompt,
  selectTitle,
  selectTagline,
  statLabels,
  messages,
  isTyping,
  error,
  scene,
  statuses,
  clues,
  character,
  canSend,
  selectCampaign,
  startGame,
  send,
  sendFromSuggestion,
} = chat

const saveGame = useSaveGame(chat)
const {
  slots: saveSlots,
  loading: saveLoading,
  busy: saveBusy,
  lastMessage: saveStatusMessage,
  refreshSlots,
  canSave: canSaveGame,
  saveToSlot,
  loadFromSlot,
  deleteSlot,
} = saveGame

watch(
  theme,
  (t) => {
    if (t) themeRef.value = t
  },
  { immediate: true },
)

onMounted(() => {
  refreshSlots()
})

watch(phase, (p) => {
  if (p === 'campaign') refreshSlots()
})

async function handleSaveToSlot(slot: number) {
  await saveToSlot(slot)
}

async function handleLoadFromSlot(slot: number) {
  if (phase.value === 'playing') {
    const ok = window.confirm('读取存档将覆盖当前未保存的进度，是否继续？')
    if (!ok) return
  }
  const ok = await loadFromSlot(slot)
  if (ok && theme.value) themeRef.value = theme.value
}

async function handleDeleteSlot(slot: number) {
  if (!window.confirm(`确定删除槽位 ${slot} 的存档？此操作不可恢复。`)) return
  if (!window.confirm('再次确认：删除该存档？')) return
  await deleteSlot(slot)
}

async function handleContinueFromCampaign(slot: number) {
  const ok = await loadFromSlot(slot)
  if (ok && theme.value) themeRef.value = theme.value
}
</script>

<template>
  <CampaignSelect
    v-if="phase === 'campaign'"
    :list="campaigns"
    :save-slots="saveSlots"
    @select="selectCampaign"
    @continue="handleContinueFromCampaign"
  />
  <CharacterSelect
    v-else-if="phase === 'select' && theme"
    :title="selectTitle"
    :tagline="selectTagline"
    :intro="introNarrator"
    :prompt="selectPrompt"
    :options="investigators"
    :stat-labels="statLabels"
    @select="startGame"
  />
  <AppShell
    v-else-if="phase === 'playing' && theme"
    :theme="theme"
    :stat-labels="statLabels"
    :messages="messages"
    :scene="scene"
    :statuses="statuses"
    :clues="clues"
    :character="character"
    :is-typing="isTyping"
    :can-send="canSend"
    :error="error"
    :save-slots="saveSlots"
    :save-loading="saveLoading"
    :save-busy="saveBusy"
    :can-save-game="canSaveGame"
    :save-status-message="saveStatusMessage"
    @send="send"
    @select-action="sendFromSuggestion($event.messageId, $event.suggestionId, $event.action)"
    @save-refresh="refreshSlots"
    @save-to-slot="handleSaveToSlot"
    @load-from-slot="handleLoadFromSlot"
    @delete-slot="handleDeleteSlot"
  />
</template>
