import type { CharacterInfo, ChatMessage, SceneInfo, StatusTag } from './chat'

export interface GameSavePayload {
  version: 1 | 2
  campaignId: string
  investigatorId: string
  phase: 'playing'
  character: CharacterInfo
  scene: SceneInfo
  messages: ChatMessage[]
  savedAt: string
  statuses?: StatusTag[]
  clues?: string[]
}

export interface SaveSlotMeta {
  slot: number
  empty: boolean
  campaignId?: string
  campaignTitle?: string
  characterName?: string
  sceneTitle?: string
  savedAt?: string
  messageCount?: number
}
