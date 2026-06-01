import type { GameSavePayload, SaveSlotMeta } from '../types/save'
import { apiFetch } from './client'

const PLAYER_ID_KEY = 'paotuan-player-id'

/** 兼容非 HTTPS / 旧浏览器：randomUUID 在部分环境不可用 */
function newPlayerId(): string {
  const c = globalThis.crypto
  if (c?.randomUUID) {
    return c.randomUUID()
  }
  if (c?.getRandomValues) {
    const bytes = new Uint8Array(16)
    c.getRandomValues(bytes)
    bytes[6] = (bytes[6] & 0x0f) | 0x40
    bytes[8] = (bytes[8] & 0x3f) | 0x80
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0
    const v = ch === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function getPlayerId(): string {
  let id = localStorage.getItem(PLAYER_ID_KEY)
  if (!id) {
    id = newPlayerId()
    localStorage.setItem(PLAYER_ID_KEY, id)
  }
  return id
}

function saveHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-Player-Id': getPlayerId(),
  }
}

async function parseError(res: Response): Promise<string> {
  if (res.status === 404) {
    return '存档接口不可用：后端未加载存档模块。请在 backend 目录运行 .\\start.ps1 重启服务后再试。'
  }
  try {
    const body = await res.json()
    if (typeof body.detail === 'string') {
      if (body.detail === 'Not Found') {
        return '存档接口不可用：请在 backend 目录运行 .\\start.ps1 重启后端后再试。'
      }
      return body.detail
    }
    return JSON.stringify(body.detail)
  } catch {
    return `请求失败 (${res.status})`
  }
}

export async function listSaves(): Promise<SaveSlotMeta[]> {
  const res = await apiFetch('/api/saves', { headers: saveHeaders() })
  if (!res.ok) throw new Error(await parseError(res))
  const data = (await res.json()) as { slots: SaveSlotMeta[] }
  return data.slots
}

export async function getSave(slot: number): Promise<GameSavePayload> {
  const res = await apiFetch(`/api/saves/${slot}`, { headers: saveHeaders() })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function putSave(slot: number, payload: GameSavePayload): Promise<SaveSlotMeta> {
  const res = await apiFetch(`/api/saves/${slot}`, {
    method: 'PUT',
    headers: saveHeaders(),
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json()
}

export async function deleteSave(slot: number): Promise<void> {
  const res = await apiFetch(`/api/saves/${slot}`, {
    method: 'DELETE',
    headers: saveHeaders(),
  })
  if (!res.ok) throw new Error(await parseError(res))
}
