import { ref, computed } from 'vue'
import type { SaveSlotMeta } from '../types/save'
import { listSaves, getSave, putSave, deleteSave } from '../api/save'
import type { useChat } from './useChat'

type ChatApi = ReturnType<typeof useChat>

export function useSaveGame(chat: ChatApi) {
  const slots = ref<SaveSlotMeta[]>([])
  const loading = ref(false)
  const busy = ref(false)
  const lastMessage = ref<string | null>(null)

  async function refreshSlots() {
    loading.value = true
    lastMessage.value = null
    try {
      slots.value = await listSaves()
    } catch (e) {
      lastMessage.value = e instanceof Error ? e.message : '无法加载存档列表'
      slots.value = [1, 2, 3].map((slot) => ({ slot, empty: true }))
    } finally {
      loading.value = false
    }
  }

  const canSave = computed(
    () => chat.phase.value === 'playing' && !chat.isTyping.value,
  )

  async function saveToSlot(slot: number): Promise<boolean> {
    if (!canSave.value) {
      lastMessage.value = '请在游戏进行中且守秘人未回复时存档'
      return false
    }
    const snapshot = chat.getSnapshot()
    if (!snapshot) {
      lastMessage.value = '当前状态无法存档'
      return false
    }
    busy.value = true
    lastMessage.value = null
    try {
      await putSave(slot, snapshot)
      lastMessage.value = `已保存到槽位 ${slot}`
      await refreshSlots()
      return true
    } catch (e) {
      lastMessage.value = e instanceof Error ? e.message : '保存失败'
      return false
    } finally {
      busy.value = false
    }
  }

  async function loadFromSlot(slot: number): Promise<boolean> {
    busy.value = true
    lastMessage.value = null
    try {
      const payload = await getSave(slot)
      chat.loadSnapshot(payload)
      lastMessage.value = '读档成功'
      return true
    } catch (e) {
      lastMessage.value = e instanceof Error ? e.message : '读档失败'
      return false
    } finally {
      busy.value = false
    }
  }

  async function deleteSlot(slot: number): Promise<boolean> {
    busy.value = true
    lastMessage.value = null
    try {
      await deleteSave(slot)
      lastMessage.value = `已删除槽位 ${slot}`
      await refreshSlots()
      return true
    } catch (e) {
      lastMessage.value = e instanceof Error ? e.message : '删除失败'
      return false
    } finally {
      busy.value = false
    }
  }

  return {
    slots,
    loading,
    busy,
    lastMessage,
    refreshSlots,
    canSave,
    saveToSlot,
    loadFromSlot,
    deleteSlot,
  }
}
