import type { StatusTag } from '../types/chat'

type StatusClueState = { statuses: StatusTag[]; clues: string[] }

type Event =
  | { kind: 'addStatus'; index: number; label: string; note?: string }
  | { kind: 'removeStatus'; index: number; label: string }
  | { kind: 'addClue'; index: number; text: string }
  | { kind: 'removeClue'; index: number; text: string }

const ADD_STATUS_RE = /【状态】\s*([^|\n】]+)(?:\|([^\n】]+))?/g
const REMOVE_STATUS_RE = /【失去状态】\s*([^\n】]+)/g
const ADD_CLUE_RE = /【获得把柄】\s*([^\n】]+)/g
const REMOVE_CLUE_RE = /【失去把柄】\s*([^\n】]+)/g

function makeStatusId(label: string): string {
  return `st-${Date.now()}-${Math.random().toString(36).slice(2, 6)}-${label.slice(0, 8)}`
}

function collectEvents(content: string): Event[] {
  const events: Event[] = []

  for (const m of content.matchAll(ADD_STATUS_RE)) {
    const label = m[1].trim()
    if (label) {
      events.push({
        kind: 'addStatus',
        index: m.index ?? 0,
        label,
        note: m[2]?.trim() || undefined,
      })
    }
  }
  for (const m of content.matchAll(REMOVE_STATUS_RE)) {
    const label = m[1].trim()
    if (label) events.push({ kind: 'removeStatus', index: m.index ?? 0, label })
  }
  for (const m of content.matchAll(ADD_CLUE_RE)) {
    const text = m[1].trim()
    if (text) events.push({ kind: 'addClue', index: m.index ?? 0, text })
  }
  for (const m of content.matchAll(REMOVE_CLUE_RE)) {
    const text = m[1].trim()
    if (text) events.push({ kind: 'removeClue', index: m.index ?? 0, text })
  }

  return events.sort((a, b) => a.index - b.index)
}

function removeClueFuzzy(clues: string[], text: string): string[] {
  const t = text.trim()
  return clues.filter((c) => c !== t && !c.includes(t) && !t.includes(c))
}

function applyEvents(base: StatusClueState, events: Event[]): StatusClueState {
  let statuses = [...base.statuses]
  let clues = [...base.clues]

  for (const ev of events) {
    if (ev.kind === 'addStatus') {
      const existing = statuses.findIndex(
        (s) => s.label === ev.label && s.source === 'story',
      )
      const tag: StatusTag = {
        id: existing >= 0 ? statuses[existing].id : makeStatusId(ev.label),
        label: ev.label,
        source: 'story',
        note: ev.note,
      }
      if (existing >= 0) statuses[existing] = tag
      else statuses.push(tag)
    } else if (ev.kind === 'removeStatus') {
      statuses = statuses.filter(
        (s) => !(s.source === 'story' && s.label === ev.label),
      )
    } else if (ev.kind === 'addClue') {
      if (!clues.includes(ev.text)) clues.push(ev.text)
    } else if (ev.kind === 'removeClue') {
      clues = removeClueFuzzy(clues, ev.text)
    }
  }

  return { statuses, clues }
}

/** 在 base 状态上应用 content 中全部状态/把柄指令（用于单条 KP 消息流式累积） */
export function applyStatusAndCluesFromContent(
  content: string,
  base: StatusClueState,
): StatusClueState {
  const events = collectEvents(content)
  if (!events.length) return base
  return applyEvents(base, events)
}
