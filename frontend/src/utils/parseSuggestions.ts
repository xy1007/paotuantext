import type { ActionSuggestion } from '../types/chat'
import { buildActionFromLabel as defaultBuildAction } from '../campaigns/darkwater-lake/actions'

const HEADER_BRACKET_RE = /【\s*行动建议\s*】\s*[:：]?/g
const HEADER_PLAIN_RE = /(?:^|\n)\s*行动建议\s*[:：]\s*/g
const LINE_ITEM_RE =
  /^\s*(?:[-—－·•*]|\d+[.、)）]|（\d+）)\s*(.+)\s*$/
const BLOCK_END_LINE_RE = /^【[^】]+】/

function makeId(): string {
  return `sug-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

function findLastSuggestionBlock(content: string): { start: number; headerLen: number } | null {
  let best: { start: number; headerLen: number } | null = null

  for (const re of [HEADER_BRACKET_RE, HEADER_PLAIN_RE]) {
    const pattern = new RegExp(re.source, re.flags)
    for (const m of content.matchAll(pattern)) {
      const start = m.index ?? -1
      if (start < 0) continue
      if (!best || start >= best.start) {
        best = { start, headerLen: m[0].length }
      }
    }
  }

  return best
}

function parseLabelsFromBlock(block: string): string[] {
  const labels: string[] = []
  let emptyStreak = 0

  for (const line of block.split('\n')) {
    const trimmed = line.trim()
    if (BLOCK_END_LINE_RE.test(trimmed)) break
    if (!trimmed) {
      emptyStreak += 1
      if (emptyStreak >= 2) break
      continue
    }
    emptyStreak = 0
    const match = trimmed.match(LINE_ITEM_RE) ?? line.match(LINE_ITEM_RE)
    if (!match) continue
    const label = match[1].trim()
    if (label) labels.push(label)
  }

  return labels
}

function labelsToSuggestions(
  labels: string[],
  templates: Record<string, string> | undefined,
  prev?: ActionSuggestion[],
): ActionSuggestion[] {
  const build = (label: string) =>
    templates ? buildActionFromLabel(label, templates) : defaultBuildAction(label)

  return labels.slice(0, 4).map((label, i) => {
    const existing = prev?.find((s) => s.label === label) ?? prev?.[i]
    return {
      id: existing?.id ?? makeId(),
      label,
      action: build(label),
    }
  })
}

export function extractSuggestions(
  content: string,
  templates?: Record<string, string>,
  prev?: ActionSuggestion[],
): ActionSuggestion[] {
  const blockInfo = findLastSuggestionBlock(content)
  if (!blockInfo) return []

  const block = content.slice(blockInfo.start + blockInfo.headerLen)
  const labels = parseLabelsFromBlock(block)
  return labelsToSuggestions(labels, templates, prev)
}

export function stripSuggestionBlock(content: string): string {
  const blockInfo = findLastSuggestionBlock(content)
  if (!blockInfo) return content.trimEnd()
  return content.slice(0, blockInfo.start).trimEnd()
}

export function buildActionFromLabel(
  label: string,
  templates: Record<string, string>,
): string {
  const trimmed = label.trim()
  if (templates[trimmed]) return templates[trimmed]
  if (trimmed.startsWith('我')) return trimmed.endsWith('。') ? trimmed : `${trimmed}。`
  return `我${trimmed.endsWith('。') ? trimmed : `${trimmed}。`}`
}

export function suggestionsFromLabels(
  labels: string[],
  templates?: Record<string, string>,
): ActionSuggestion[] {
  return labelsToSuggestions(labels, templates)
}

const GLOBAL_FALLBACK_LABELS = ['继续观察', '进一步行动']

function resolveFallbackLabels(fallbackLabels: string[]): string[] {
  const fromCampaign = fallbackLabels.filter(Boolean).slice(0, 4)
  if (fromCampaign.length >= 2) return fromCampaign
  const merged = [...fromCampaign, ...GLOBAL_FALLBACK_LABELS]
  return [...new Set(merged)].slice(0, 4)
}

export function ensureDmSuggestions(
  rawContent: string,
  templates: Record<string, string>,
  fallbackLabels: string[],
  prev?: ActionSuggestion[],
): { content: string; suggestions: ActionSuggestion[] } {
  const parsed = extractSuggestions(rawContent, templates, prev)
  if (parsed.length > 0) {
    return {
      content: stripSuggestionBlock(rawContent),
      suggestions: parsed,
    }
  }
  const labels = resolveFallbackLabels(fallbackLabels)
  return {
    content: rawContent.trimEnd(),
    suggestions: suggestionsFromLabels(labels, templates),
  }
}
