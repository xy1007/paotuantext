/** 快捷标签 -> 发送给 KP 的玩家台词 */
export const actionTemplates: Record<string, string> = {
  调查: '我仔细调查当前环境中的可疑之处。',
  交谈: '我尝试与在场的人交谈，打听消息。',
  观察: '我观察周围，注意任何异常细节。',
  前往旅馆: '我前往枫树街旅馆。',
  查看布告栏: '我查看车站布告栏上的启事与通知。',
}

export function buildActionFromLabel(label: string): string {
  const trimmed = label.trim()
  if (actionTemplates[trimmed]) return actionTemplates[trimmed]
  if (trimmed.startsWith('我')) return trimmed.endsWith('。') ? trimmed : `${trimmed}。`
  return `我${trimmed.endsWith('。') ? trimmed : `${trimmed}。`}`
}
