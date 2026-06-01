import type { SceneInfo } from '../types/chat'

const SCENE_TAG_RE = /【场景】\s*([^\n|】]+)(?:\|([^\n]+))?/g
const SCENE_DASH_RE = /——\s*([^—\n]+?)\s*——/g

/**
 * 从 KP 回复中提取最后一次场景切换。
 * 优先【场景】标题|描述，其次 —— 标题 ——（仅更新标题，描述保留 currentDescription）。
 */
export function extractScene(content: string, currentDescription = ''): SceneInfo | null {
  let lastTagged: SceneInfo | null = null
  for (const m of content.matchAll(SCENE_TAG_RE)) {
    const title = m[1].trim()
    if (!title) continue
    lastTagged = {
      title,
      description: m[2]?.trim() || currentDescription,
    }
  }
  if (lastTagged) return lastTagged

  let lastDashTitle: string | null = null
  for (const m of content.matchAll(SCENE_DASH_RE)) {
    const title = m[1].trim()
    if (title) lastDashTitle = title
  }
  if (lastDashTitle) {
    return { title: lastDashTitle, description: currentDescription }
  }

  return null
}
