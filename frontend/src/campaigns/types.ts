import type { CharacterInfo, SceneInfo, ThemeConfig } from '../types/chat'

export interface InvestigatorOption {
  id: string
  title: string
  subtitle: string
  description: string
  items: string[]
  character: CharacterInfo
}

export interface CampaignStatLabels {
  primary: string
  secondary: string
}

export interface CampaignInitialStatus {
  label: string
  note?: string
}

export interface CampaignDefinition {
  id: string
  title: string
  tagline: string
  theme: ThemeConfig
  introNarrator: string
  openingNarrator: string
  initialScene: SceneInfo
  playingScene: SceneInfo
  actionTemplates: Record<string, string>
  /** LLM 未输出【行动建议】时的兜底标签（2–4 条） */
  fallbackSuggestionLabels: string[]
  investigators: InvestigatorOption[]
  mockOpeningDm: string
  statLabels: CampaignStatLabels
  selectPrompt: string
  initialStatuses?: CampaignInitialStatus[]
  initialClues?: string[]
}
