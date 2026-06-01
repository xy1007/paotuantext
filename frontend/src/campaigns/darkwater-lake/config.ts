import type { CampaignDefinition, InvestigatorOption } from '../types'
import { darkwaterLakeTheme } from '../../styles/themes/darkwater-lake'
import { actionTemplates } from './actions'

export const CAMPAIGN_ID = 'darkwater-lake'

export const INTRO_NARRATOR = `《暗湖魅影》· 单人模式

1925年10月，深秋。美国马萨诸塞州北部的黑水镇笼罩在铅灰色天空下。

你的好友——考古学教授霍华德·阿特金斯，一个月前来此调查印第安湖怪传说，随后失联。他最后一封信只有一句：

「它们在湖底的黑暗里看着我。我不能弯腰。快逃……但别靠近湖水。」

你决定前往黑水镇寻找真相。`

export const OPENING_NARRATOR =
  '1925年10月23日傍晚，火车喷着白色蒸汽，缓缓停靠在黑水镇站台。站台上空无一人，只有浓雾贴着铁轨流动，带着湖水与腐烂树叶的气息。'

const investigators: InvestigatorOption[] = [
  {
    id: 'A',
    title: '私家侦探',
    subtitle: '受阿特金斯夫人委托寻人',
    description: '擅长侦查、潜行、拳击与追踪。',
    items: ['手枪', '手电筒', '开锁工具'],
    character: {
      name: '私家侦探',
      hp: 12,
      maxHp: 12,
      san: 60,
      maxSan: 99,
      attrs: { 侦查: 70, 潜行: 65, 拳击: 55, 追踪: 60 },
    },
  },
  {
    id: 'B',
    title: '记者',
    subtitle: '黑水镇的诡异传闻引起报社兴趣',
    description: '擅长摄影、图书馆使用、话术与心理学。',
    items: ['照相机', '笔记本', '钢笔', '手电筒'],
    character: {
      name: '记者',
      hp: 12,
      maxHp: 12,
      san: 55,
      maxSan: 99,
      attrs: { 摄影: 60, 图书馆: 55, 话术: 65, 心理学: 50 },
    },
  },
  {
    id: 'C',
    title: '学者',
    subtitle: '阿特金斯的学术同行，神秘学爱好者',
    description: '擅长神秘学、历史、外语（拉丁文）与图书馆使用。',
    items: ['古籍笔记', '放大镜', '绘图铅笔'],
    character: {
      name: '学者',
      hp: 12,
      maxHp: 12,
      san: 50,
      maxSan: 99,
      attrs: { 神秘学: 70, 历史: 65, 外语: 60, 图书馆: 60 },
    },
  },
  {
    id: 'D',
    title: '医生',
    subtitle: '阿特金斯的老友，担心他的精神状态',
    description: '擅长急救、医学、心理学与药剂。',
    items: ['医疗包', '镇静剂', '手术刀'],
    character: {
      name: '医生',
      hp: 12,
      maxHp: 12,
      san: 65,
      maxSan: 99,
      attrs: { 急救: 70, 医学: 65, 心理学: 55, 药剂: 50 },
    },
  },
]

export const darkwaterLakeCampaign: CampaignDefinition = {
  id: CAMPAIGN_ID,
  title: '暗湖魅影',
  tagline: '克苏鲁悬疑 · 1925 黑水镇',
  theme: darkwaterLakeTheme,
  introNarrator: INTRO_NARRATOR,
  openingNarrator: OPENING_NARRATOR,
  initialScene: {
    title: '身份选择',
    description: '请选择你的调查员身份，守秘人将据此展开故事。',
  },
  playingScene: {
    title: '黑水镇火车站',
    description: '浓雾笼罩的站台，远处湖水方向隐约泛着不祥的绿光。',
  },
  actionTemplates,
  fallbackSuggestionLabels: [
    '与眼前之人交谈',
    '仔细观察异常',
    '查看周围线索',
    '沿主路离开站台',
  ],
  investigators,
  selectPrompt: '请选择调查员身份（A/B/C/D）',
  statLabels: { primary: 'HP', secondary: '理智' },
  initialStatuses: [],
  initialClues: [],
  mockOpeningDm: `站台上只有一个瘦高的男人，制服笔挺，却以一种不自然的僵硬站立着——他的眼睛睁得过大，几乎不眨。

火车停稳后，他整个人像一块木板般转向你，而非扭动脖颈。「旅馆在枫树街尽头。」他的声音平板无波，「晚上别去湖边。雾气有毒。」

站房的布告栏上贴着寻人启事，其中一张被撕去一半——你认出那是霍华德·阿特金斯的照片。

浓雾深处，湖水方向隐约透出幽幽绿光，像某种东西在呼吸。

【行动建议】
- 与站长塞拉斯交谈
- 查看布告栏
- 观察站台异常
- 前往枫树街旅馆`,
}

export function getInvestigator(id: string) {
  const found = investigators.find((i) => i.id === id)
  if (!found) throw new Error(`Unknown investigator: ${id}`)
  return found
}
