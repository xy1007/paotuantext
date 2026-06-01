import type { CharacterInfo } from '../types/chat'
import type { CampaignStatLabels } from '../campaigns/types'

type StatField = 'hp' | 'san'

type StatEvent = { index: number; field: StatField; value: number }

const GLOBAL_ALIASES: Record<string, StatField> = {
  HP: 'hp',
  hp: 'hp',
  SAN: 'san',
  san: 'san',
  理智: 'san',
  恩宠: 'hp',
  势力: 'san',
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildLabelMap(labels: CampaignStatLabels): Record<string, StatField> {
  const map: Record<string, StatField> = { ...GLOBAL_ALIASES }
  map[labels.primary.trim()] = 'hp'
  map[labels.secondary.trim()] = 'san'
  return map
}

function collectStatEvents(content: string, labelMap: Record<string, StatField>): StatEvent[] {
  const names = [...new Set(Object.keys(labelMap))].sort((a, b) => b.length - a.length)
  if (!names.length) return []

  const namePattern = names.map(escapeRegExp).join('|')
  const events: StatEvent[] = []

  const statRe = new RegExp(
    `【\\s*(${namePattern})\\s*(?:([+-])\\s*(\\d+)\\s*[,，]\\s*)?当前\\s*(\\d+)\\s*】`,
    'gi',
  )

  for (const m of content.matchAll(statRe)) {
    const key = m[1].trim()
    const field = labelMap[key] ?? labelMap[key.toLowerCase()]
    if (!field) continue
    events.push({ index: m.index ?? 0, field, value: Number.parseInt(m[4], 10) })
  }

  return events.sort((a, b) => a.index - b.index)
}

/** 在 base 角色卡上应用 content 中全部数值标注（单条 KP 消息流式重算） */
export function applyStatsFromContent(
  content: string,
  base: CharacterInfo,
  labels: CampaignStatLabels,
): CharacterInfo {
  const labelMap = buildLabelMap(labels)
  const events = collectStatEvents(content, labelMap)
  if (!events.length) return base

  let hp = base.hp
  let san = base.san
  for (const ev of events) {
    if (ev.field === 'hp') hp = ev.value
    else san = ev.value
  }

  return {
    ...base,
    hp: clamp(hp, 0, base.maxHp),
    san: clamp(san, 0, base.maxSan),
    attrs: { ...base.attrs },
  }
}
