import type { ChatMessage } from '../types/chat'
import { apiFetch } from './client'

export interface StreamCallbacks {
  onToken: (token: string) => void
  onDone: () => void
  onError: (message: string) => void
}

export async function streamChat(
  messages: ChatMessage[],
  campaignId: string,
  callbacks: StreamCallbacks,
  signal?: AbortSignal,
): Promise<void> {
  const payload = {
    campaign_id: campaignId,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  }

  const response = await apiFetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  })

  if (!response.ok) {
    let detail = `请求失败 (${response.status})`
    try {
      const err = await response.json()
      if (err.detail) detail = typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail)
    } catch {
      /* ignore */
    }
    callbacks.onError(detail)
    return
  }

  const reader = response.body?.getReader()
  if (!reader) {
    callbacks.onError('无法读取响应流')
    return
  }

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (data === '[DONE]') {
        callbacks.onDone()
        return
      }
      try {
        const parsed = JSON.parse(data) as { content?: string; error?: string }
        if (parsed.error) {
          callbacks.onError(parsed.error)
          return
        }
        if (parsed.content) callbacks.onToken(parsed.content)
      } catch {
        /* skip malformed */
      }
    }
  }

  callbacks.onDone()
}

export async function checkHealth(): Promise<{
  api_key_configured: boolean
  default_campaign?: string
  hint?: string
  env_file_exists?: boolean
}> {
  const res = await apiFetch('/api/health')
  if (!res.ok) return { api_key_configured: false }
  return res.json()
}
