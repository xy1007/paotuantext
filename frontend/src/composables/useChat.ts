import { ref, computed, nextTick, type Ref } from 'vue'
import type { ChatMessage, SceneInfo, CharacterInfo, StatusTag, ThemeConfig } from '../types/chat'
import type { GameSavePayload } from '../types/save'
import { streamChat, checkHealth } from '../api/chat'
import { campaigns, getCampaign, type CampaignDefinition } from '../campaigns'
import { extractScene } from '../utils/parseScene'
import { applyStatusAndCluesFromContent } from '../utils/parseStatus'
import { applyStatsFromContent } from '../utils/parseStats'
import {
  ensureDmSuggestions,
  extractSuggestions,
} from '../utils/parseSuggestions'

export type GamePhase = 'campaign' | 'select' | 'playing'

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function useChat() {
  const phase = ref<GamePhase>('campaign')
  const activeCampaign = ref<CampaignDefinition | null>(null)
  const investigatorId = ref('')
  const campaignId = computed(() => activeCampaign.value?.id ?? '')
  const messages = ref<ChatMessage[]>([])
  const isTyping = ref(false)
  const error = ref<string | null>(null)
  const apiAvailable = ref(false)
  let abortController: AbortController | null = null

  const scene = ref<SceneInfo>({ title: '', description: '' })
  const statuses = ref<StatusTag[]>([])
  const clues = ref<string[]>([])
  let dmStatusClueBase: { statuses: StatusTag[]; clues: string[] } = {
    statuses: [],
    clues: [],
  }
  let dmCharacterBase: CharacterInfo = {
    name: '',
    hp: 0,
    maxHp: 100,
    san: 0,
    maxSan: 100,
    attrs: {},
  }
  const character = ref<CharacterInfo>({
    name: '未选择',
    hp: 0,
    maxHp: 100,
    san: 0,
    maxSan: 100,
    attrs: {},
  })

  const theme = computed<ThemeConfig | null>(() => activeCampaign.value?.theme ?? null)
  const introNarrator = computed(() => activeCampaign.value?.introNarrator ?? '')
  const investigators = computed(() => activeCampaign.value?.investigators ?? [])
  const selectPrompt = computed(() => activeCampaign.value?.selectPrompt ?? '')
  const selectTitle = computed(() => activeCampaign.value?.title ?? '')
  const selectTagline = computed(() => activeCampaign.value?.tagline ?? '')
  const statLabels = computed(
    () => activeCampaign.value?.statLabels ?? { primary: 'HP', secondary: 'SAN' },
  )

  const canSend = computed(() => phase.value === 'playing' && !isTyping.value)

  async function ensureApiReady(): Promise<boolean> {
    try {
      const health = await checkHealth()
      apiAvailable.value = health.api_key_configured
      if (!health.api_key_configured) {
        const hint =
          'hint' in health && typeof health.hint === 'string' && health.hint
            ? health.hint
            : ''
        error.value =
          hint ||
          '后端未检测到 API Key。请创建 backend/.env（不是 .env.example），填入 DEEPSEEK_API_KEY 后重启 uvicorn。'
      }
      return health.api_key_configured
    } catch {
      apiAvailable.value = false
      error.value = '无法连接后端。请先启动：cd backend && .\\start.ps1'
      return false
    }
  }

  function initStatusesAndCluesFromCampaign(c: CampaignDefinition) {
    statuses.value = (c.initialStatuses ?? []).map((s, i) => ({
      id: `camp-${i}-${s.label}`,
      label: s.label,
      source: 'campaign' as const,
      note: s.note,
    }))
    clues.value = [...(c.initialClues ?? [])]
  }

  function snapshotDmTurnBase() {
    dmStatusClueBase = {
      statuses: statuses.value.map((s) => ({ ...s })),
      clues: [...clues.value],
    }
    dmCharacterBase = {
      ...character.value,
      attrs: { ...character.value.attrs },
    }
  }

  function applyStatusCluesFromContent(rawContent: string) {
    const next = applyStatusAndCluesFromContent(rawContent, dmStatusClueBase)
    statuses.value = next.statuses
    clues.value = next.clues
  }

  function applyCharacterStatsFromContent(rawContent: string) {
    const labels = statLabels.value
    character.value = applyStatsFromContent(rawContent, dmCharacterBase, labels)
  }

  function selectCampaign(id: string) {
    const c = getCampaign(id)
    activeCampaign.value = c
    scene.value = { ...c.initialScene }
    statuses.value = []
    clues.value = []
    phase.value = 'select'
    error.value = null
  }

  function addMessage(role: ChatMessage['role'], content: string, streaming = false): string {
    const id = uid()
    messages.value.push({ id, role, content, streaming })
    return id
  }

  function updateMessage(id: string, content: string) {
    const msg = messages.value.find((m) => m.id === id)
    if (msg) msg.content = content
  }

  function finishMessage(id: string) {
    const msg = messages.value.find((m) => m.id === id)
    if (msg) msg.streaming = false
  }

  function previewSuggestionsToMessage(messageId: string, rawContent: string) {
    const c = activeCampaign.value
    if (!c) return
    const msg = messages.value.find((m) => m.id === messageId)
    if (!msg) return

    const parsed = extractSuggestions(rawContent, c.actionTemplates, msg.suggestions)
    if (parsed.length > 0) {
      msg.suggestions = parsed
    }
  }

  function applySuggestionsToMessage(messageId: string, rawContent: string) {
    const c = activeCampaign.value
    if (!c) return
    const msg = messages.value.find((m) => m.id === messageId)
    if (!msg) return

    const { content, suggestions } = ensureDmSuggestions(
      rawContent,
      c.actionTemplates,
      c.fallbackSuggestionLabels,
      msg.suggestions,
    )
    msg.content = content
    msg.suggestions = suggestions
  }

  function findPendingSuggestionMessageId(): string | null {
    for (let i = messages.value.length - 1; i >= 0; i--) {
      const m = messages.value[i]
      if (m.role === 'player') return null
      if (
        !m.streaming &&
        (m.role === 'dm' || m.role === 'system') &&
        (m.suggestions?.length ?? 0) > 0 &&
        !m.chosenSuggestionId
      ) {
        return m.id
      }
    }
    return null
  }

  function lockPendingSuggestions(chosenId = '__manual__') {
    const pendingId = findPendingSuggestionMessageId()
    if (!pendingId) return
    const msg = messages.value.find((m) => m.id === pendingId)
    if (msg && !msg.chosenSuggestionId) {
      msg.chosenSuggestionId = chosenId
    }
  }

  function parseDiceFromContent(content: string) {
    const dicePattern = /【检定[^】]+】/g
    const matches = content.match(dicePattern)
    if (!matches?.length) return
    const last = matches[matches.length - 1]
    const existing = messages.value.some((m) => m.role === 'dice' && m.content === last)
    if (!existing) addMessage('dice', last.replace(/【|】/g, '').trim())
  }

  function applySceneFromContent(rawContent: string) {
    const parsed = extractScene(rawContent, scene.value.description)
    if (!parsed) return
    scene.value = parsed
  }

  function finalizeKeeperMessage(messageId: string, fullContent: string) {
    const c = activeCampaign.value
    if (!c) return
    finishMessage(messageId)
    parseDiceFromContent(fullContent)
    applySceneFromContent(fullContent)
    applyStatusCluesFromContent(fullContent)
    applyCharacterStatsFromContent(fullContent)
    applySuggestionsToMessage(messageId, fullContent)
  }

  async function mockKeeperReply(hint: string) {
    const c = activeCampaign.value
    const replies =
      c?.id === 'jincheng-shadow'
        ? [
            `你${hint.replace(/^我/, '')}。殿角有人交换眼色，却不敢当面驳你——他们开始拿不准，你是不是还那么「好欺负」。`,
            `你话音落下，皇后唇角一抿，丽贵妃党的人脸色发白。皇帝的目光在你身上多停了一瞬：这才人，有点意思。`,
          ]
        : [
            `你${hint.replace(/^我/, '')}。雾气更浓了，远处湖面的绿光微微脉动。站长用僵硬的动作望向你，等待你的下一句话。`,
            `一阵寒意从湖方向吹来。你注意到站台上其他人的举止都透着诡异的「笔直」——仿佛脊椎被什么东西固定住，再也无法弯曲。`,
          ]
    const body = replies[Math.floor(Math.random() * replies.length)]
    const mockSuggestions = c?.fallbackSuggestionLabels ?? []
    const text = `${body}\n\n【行动建议】\n${mockSuggestions.map((s) => `- ${s}`).join('\n')}`
    isTyping.value = true
    await new Promise((r) => setTimeout(r, 400))
    const id = addMessage('dm', '', true)
    snapshotDmTurnBase()
    isTyping.value = false
    for (const char of text) {
      const msg = messages.value.find((m) => m.id === id)
      if (msg) msg.content += char
      await new Promise((r) => setTimeout(r, 15))
    }
    finalizeKeeperMessage(id, text)
  }

  async function requestKeeper(
    history: ChatMessage[],
    options?: { fallbackOpening?: boolean },
  ): Promise<void> {
    await ensureApiReady()
    const cid = campaignId.value
    if (!cid) return

    if (apiAvailable.value) {
      isTyping.value = true
      const dmId = addMessage('dm', '', true)
      snapshotDmTurnBase()
      abortController = new AbortController()
      let fullContent = ''

      await streamChat(
        history,
        cid,
        {
          onToken: (token) => {
            isTyping.value = false
            fullContent += token
            updateMessage(dmId, fullContent)
            applySceneFromContent(fullContent)
            applyStatusCluesFromContent(fullContent)
            applyCharacterStatsFromContent(fullContent)
            previewSuggestionsToMessage(dmId, fullContent)
          },
          onDone: () => {
            isTyping.value = false
            finalizeKeeperMessage(dmId, fullContent)
          },
          onError: async (msg) => {
            isTyping.value = false
            messages.value = messages.value.filter((m) => m.id !== dmId)
            error.value = msg
            if (options?.fallbackOpening) {
              await mockOpeningDm()
            } else {
              addMessage('system', '守秘人暂时无法回应，请检查网络或 API 配置后重试。')
            }
          },
        },
        abortController.signal,
      )
    } else if (options?.fallbackOpening) {
      await mockOpeningDm()
    } else {
      const lastPlayer = [...history].reverse().find((m) => m.role === 'player')
      await mockKeeperReply(lastPlayer?.content ?? '行动')
    }
  }

  async function mockOpeningDm() {
    const c = activeCampaign.value
    if (!c) return
    isTyping.value = true
    await new Promise((r) => setTimeout(r, 500))
    const id = addMessage('dm', '', true)
    snapshotDmTurnBase()
    isTyping.value = false
    for (const char of c.mockOpeningDm) {
      const msg = messages.value.find((m) => m.id === id)
      if (msg) {
        msg.content += char
        previewSuggestionsToMessage(id, msg.content)
      }
      await new Promise((r) => setTimeout(r, 12))
    }
    finishMessage(id)
    applySuggestionsToMessage(id, c.mockOpeningDm)
    applySceneFromContent(c.mockOpeningDm)
    applyStatusCluesFromContent(c.mockOpeningDm)
    applyCharacterStatsFromContent(c.mockOpeningDm)
  }

  async function startGame(selectedInvestigatorId: string) {
    const c = activeCampaign.value
    if (!c) return
    const inv = c.investigators.find((i) => i.id === selectedInvestigatorId)
    if (!inv) return

    investigatorId.value = selectedInvestigatorId
    character.value = { ...inv.character }
    phase.value = 'playing'
    scene.value = { ...c.playingScene }
    initStatusesAndCluesFromCampaign(c)
    messages.value = []
    error.value = null

    addMessage('narrator', c.openingNarrator)

    const playerLine =
      c.id === 'jincheng-shadow'
        ? `我是沈青鸾，${inv.subtitle}。这膝盖上的疼，我会一笔笔讨回来。`
        : `我选择身份：${inv.id} · ${inv.title}。${inv.subtitle}`

    addMessage('player', playerLine)

    const attrs = Object.entries(inv.character.attrs)
      .map(([k, v]) => `${k}${v}`)
      .join(' ')

    const statusHint =
      statuses.value.length > 0
        ? `剧本状态：${statuses.value.map((s) => s.label).join('、')}。`
        : ''
    const clueHint = clues.value.length > 0 ? `把柄：${clues.value.join('、')}。` : '把柄清单为空。'

    const sysContent =
      c.id === 'jincheng-shadow'
        ? `[游戏开始] 玩家扮演沈青鸾（凤鸣九天爽剧版）。恩宠=${inv.character.hp}，势力=${inv.character.san}。${clueHint}${statusHint}技能：${attrs}。数值变动须标注如【恩宠 +15，当前35】【势力 +5，当前15】；状态/把柄用【状态】【获得把柄】等。请按手册开场，等待行动。`
        : `[游戏开始] 玩家选择：${inv.id} ${inv.title}。HP=${inv.character.hp}，理智=${inv.character.san}。技能：${attrs}。${statusHint}${clueHint}HP/理智变动须标注如【HP -2，当前10】【理智 -3，当前57】；状态/把柄用【状态】【获得把柄】等。请按手册开场，等待行动。`

    const history: ChatMessage[] = [
      { id: 'sys-start', role: 'system', content: sysContent },
      ...messages.value.map((m) => ({ ...m })),
    ]

    await requestKeeper(history, { fallbackOpening: true })
  }

  async function sendFromSuggestion(
    messageId: string,
    suggestionId: string,
    action: string,
  ) {
    const text = action.trim()
    if (!text || !canSend.value) return

    if (findPendingSuggestionMessageId() !== messageId) return
    const dmMsg = messages.value.find((m) => m.id === messageId)
    if (!dmMsg || dmMsg.chosenSuggestionId) return

    error.value = null
    dmMsg.chosenSuggestionId = suggestionId
    addMessage('player', text)

    const history = messages.value
      .filter((m) => !m.streaming && m.role !== 'dice')
      .map((m) => ({ id: m.id, role: m.role, content: m.content }))

    await requestKeeper(history)
  }

  async function send(content: string) {
    const text = content.trim()
    if (!text || !canSend.value) return

    error.value = null
    lockPendingSuggestions()
    addMessage('player', text)

    const history = messages.value
      .filter((m) => !m.streaming && m.role !== 'dice')
      .map((m) => ({ id: m.id, role: m.role, content: m.content }))

    await requestKeeper(history)
  }

  function cancel() {
    abortController?.abort()
    isTyping.value = false
  }

  function getSnapshot(): GameSavePayload | null {
    if (phase.value !== 'playing' || !activeCampaign.value || !investigatorId.value) {
      return null
    }
    const msgs = messages.value
      .filter((m) => !m.streaming)
      .map(({ id, role, content, suggestions, chosenSuggestionId }) => ({
        id,
        role,
        content,
        ...(suggestions?.length ? { suggestions } : {}),
        ...(chosenSuggestionId ? { chosenSuggestionId } : {}),
      }))
    return {
      version: 2,
      campaignId: activeCampaign.value.id,
      investigatorId: investigatorId.value,
      phase: 'playing',
      character: { ...character.value },
      scene: { ...scene.value },
      messages: msgs,
      statuses: statuses.value.map((s) => ({ ...s })),
      clues: [...clues.value],
      savedAt: new Date().toISOString(),
    }
  }

  function loadSnapshot(payload: GameSavePayload) {
    cancel()
    const c = getCampaign(payload.campaignId)
    activeCampaign.value = c
    investigatorId.value = payload.investigatorId
    character.value = { ...payload.character }
    scene.value = { ...payload.scene }
    statuses.value = (payload.statuses ?? []).map((s) => ({ ...s }))
    clues.value = [...(payload.clues ?? [])]
    messages.value = payload.messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      suggestions: m.suggestions,
      chosenSuggestionId: m.chosenSuggestionId,
      streaming: false,
    }))
    const lastDm = [...messages.value]
      .reverse()
      .find(
        (m) =>
          (m.role === 'dm' || m.role === 'system') &&
          !m.chosenSuggestionId &&
          (m.suggestions?.length ?? 0) === 0,
      )
    if (lastDm) {
      applySuggestionsToMessage(lastDm.id, lastDm.content)
    }
    phase.value = 'playing'
    error.value = null
  }

  ensureApiReady()

  return {
    phase,
    campaigns,
    activeCampaign,
    campaignId,
    investigatorId,
    theme,
    introNarrator,
    investigators,
    selectPrompt,
    selectTitle,
    selectTagline,
    statLabels,
    messages,
    isTyping,
    error,
    apiAvailable,
    scene,
    statuses,
    clues,
    character,
    canSend,
    selectCampaign,
    startGame,
    send,
    sendFromSuggestion,
    cancel,
    getSnapshot,
    loadSnapshot,
  }
}

export function useAutoScroll(containerRef: Ref<HTMLElement | null>) {
  let userScrolledUp = false

  function scrollToBottom(smooth = true) {
    nextTick(() => {
      const el = containerRef.value
      if (!el || userScrolledUp) return
      el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' })
    })
  }

  function onScroll() {
    const el = containerRef.value
    if (!el) return
    const threshold = 80
    userScrolledUp = el.scrollHeight - el.scrollTop - el.clientHeight > threshold
  }

  function resetScrollLock() {
    userScrolledUp = false
    scrollToBottom(false)
  }

  return { scrollToBottom, onScroll, resetScrollLock }
}
