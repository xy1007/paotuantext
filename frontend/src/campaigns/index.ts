import type { CampaignDefinition } from './types'
import { darkwaterLakeCampaign } from './darkwater-lake/config'
import { jinchengShadowCampaign } from './jincheng-shadow/config'

export const campaigns: CampaignDefinition[] = [
  darkwaterLakeCampaign,
  jinchengShadowCampaign,
]

export function getCampaign(id: string): CampaignDefinition {
  const c = campaigns.find((x) => x.id === id)
  if (!c) throw new Error(`Unknown campaign: ${id}`)
  return c
}

export type { CampaignDefinition, CampaignStatLabels, InvestigatorOption } from './types'
