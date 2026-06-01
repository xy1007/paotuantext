import type { CampaignDefinition } from '../types'
import { jinchengShadowTheme } from '../../styles/themes/jincheng-shadow'
import { actionTemplates } from './actions'

export const CAMPAIGN_ID = 'jincheng-shadow'

export const INTRO_NARRATOR = `《锦城幽影 · 凤鸣九天》· 单人爽剧

启元十一年暮春，大燕皇宫锦城。

你是沈青鸾，正七品才人，刚入宫三个月。皇后罚你跪、丽贵妃视你为蝼蚁——但你读的是《资治通鉴》，学的是帝王心术。

隐忍布局 → 收集把柄 → 当众揭发 → 打脸反派 → 晋升位分。从人人可欺的才人，一路走到后宫之主。

所需：百分骰 d100 · 预计 2–3 小时`

export const OPENING_NARRATOR =
  '启元十一年暮春，凤仪宫外。你已在冰冷的石砖上跪了两个时辰，膝盖淤青未消，脑子里却在记——记每一个窃笑的宫女，记皇后高高在上的脸。'

const investigators = [
  {
    id: 'main',
    title: '沈青鸾',
    subtitle: '正七品才人 · 都察院左都御史之女',
    description:
      '察言观色、巧言令色、布局谋划、才艺展示。恩宠与势力决定你能走多远；把柄清单是你最锋利的刀。',
    items: ['入宫敕令', '把柄清单（空）', '素银护甲'],
    character: {
      name: '沈青鸾',
      hp: 20,
      maxHp: 100,
      san: 10,
      maxSan: 100,
      attrs: {
        察言观色: 50,
        巧言令色: 50,
        布局谋划: 40,
        才艺展示: 60,
      },
    },
  },
]

export const jinchengShadowCampaign: CampaignDefinition = {
  id: CAMPAIGN_ID,
  title: '锦城幽影 · 凤鸣九天',
  tagline: '宫廷爽剧 · 隐忍晋升',
  theme: jinchengShadowTheme,
  introNarrator: INTRO_NARRATOR,
  openingNarrator: OPENING_NARRATOR,
  initialScene: {
    title: '入宫',
    description: '沈青鸾已设定。确认角色后开始凤仪宫外的立威之路。',
  },
  playingScene: {
    title: '凤仪宫外',
    description: '暮春石砖冰冷，六宫目光如针。隐忍，是为了日后的反击。',
  },
  actionTemplates,
  fallbackSuggestionLabels: [
    '继续观察局势',
    '出言试探对方',
    '暂时隐忍不语',
    '借机反击立威',
  ],
  investigators,
  selectPrompt: '确认角色，开始凤鸣九天',
  statLabels: { primary: '恩宠', secondary: '势力' },
  initialStatuses: [],
  initialClues: [],
  mockOpeningDm: `【场景】凤仪宫外|冰冷的石砖，六宫目光如针。

启元十一年暮春，你跪在凤仪宫门外，已满两个时辰。皇后赫舍里氏「忘了」叫你起身——你膝盖上的淤青半月才消，此刻又添新痛。

有丽贵妃宫里的掌事宫女路过，故意用鞋尖碰翻你身旁的茶盏，还低声道：「才人也配在这站着？」

你垂目不语，却把她的脸、她的声音、她袖口绣的纹样，一一记进心里。

远处凤仪宫门开了一线，内侍尖声道：「皇后娘娘有旨——」

【行动建议】
- 隐忍观察
- 记下列人的脸
- 向皇后请安
- 掌嘴跋扈宫女`,
}

export function getInvestigator(id: string) {
  const found = investigators.find((i) => i.id === id)
  if (!found) throw new Error(`Unknown investigator: ${id}`)
  return found
}
