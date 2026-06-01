export type MessageRole = 'narrator' | 'dm' | 'player' | 'system' | 'dice'

export interface ActionSuggestion {
  id: string
  label: string
  action: string
}

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  streaming?: boolean
  suggestions?: ActionSuggestion[]
  /** 已选建议 id，或 __manual__ 表示玩家用手输回复 */
  chosenSuggestionId?: string
}

export interface ThemeConfig {
  id: string
  name: string
  colors: Record<string, string>
  fonts: {
    narrative: string
    ui: string
  }
}

export interface SceneInfo {
  title: string
  description: string
}

export interface CharacterInfo {
  name: string
  hp: number
  maxHp: number
  san: number
  maxSan: number
  attrs: Record<string, number>
}

export interface StatusTag {
  id: string
  label: string
  source: 'campaign' | 'story'
  note?: string
}
