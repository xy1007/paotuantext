<script setup lang="ts">
import { computed } from 'vue'
import type { CharacterInfo, StatusTag } from '../../types/chat'
import type { CampaignStatLabels } from '../../campaigns/types'

const props = defineProps<{
  character: CharacterInfo
  statLabels: CampaignStatLabels
  statuses: StatusTag[]
  clues: string[]
}>()

const campaignStatuses = computed(() =>
  props.statuses.filter((s) => s.source === 'campaign'),
)
const storyStatuses = computed(() => props.statuses.filter((s) => s.source === 'story'))
</script>

<template>
  <div class="character-panel">
    <h2 class="panel-title">角色卡</h2>
    <p class="char-name">{{ character.name }}</p>

    <div class="stat-row">
      <div class="stat">
        <span class="stat-label">{{ statLabels.primary }}</span>
        <div class="stat-bar">
          <div
            class="stat-fill hp"
            :style="{ width: `${(character.hp / character.maxHp) * 100}%` }"
          />
        </div>
        <span class="stat-value">{{ character.hp }} / {{ character.maxHp }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">{{ statLabels.secondary }}</span>
        <div class="stat-bar">
          <div
            class="stat-fill san"
            :style="{ width: `${(character.san / character.maxSan) * 100}%` }"
          />
        </div>
        <span class="stat-value">{{ character.san }} / {{ character.maxSan }}</span>
      </div>
    </div>

    <div class="attrs">
      <div v-for="(val, key) in character.attrs" :key="key" class="attr">
        <span class="attr-key">{{ key }}</span>
        <span class="attr-val">{{ val }}</span>
      </div>
    </div>

    <section class="block">
      <h3 class="block-title">剧本状态</h3>
      <div v-if="campaignStatuses.length" class="tag-list">
        <span v-for="s in campaignStatuses" :key="s.id" class="tag tag-campaign">
          {{ s.label }}
          <span v-if="s.note" class="tag-note">{{ s.note }}</span>
        </span>
      </div>
      <p v-else class="empty">暂无</p>
    </section>

    <section class="block">
      <h3 class="block-title">剧情状态</h3>
      <div v-if="storyStatuses.length" class="tag-list">
        <span v-for="s in storyStatuses" :key="s.id" class="tag tag-story">
          {{ s.label }}
          <span v-if="s.note" class="tag-note">{{ s.note }}</span>
        </span>
      </div>
      <p v-else class="empty">暂无</p>
    </section>

    <section class="block">
      <h3 class="block-title">把柄清单</h3>
      <ul v-if="clues.length" class="clue-list">
        <li v-for="(clue, i) in clues" :key="i">{{ clue }}</li>
      </ul>
      <p v-else class="empty">空</p>
    </section>
  </div>
</template>

<style scoped>
.character-panel {
  padding: 16px;
}

.panel-title {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.char-name {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--accent);
}

.stat-row {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 24px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-muted);
  display: block;
  margin-bottom: 4px;
}

.stat-bar {
  height: 6px;
  background: var(--border);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 4px;
}

.stat-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s;
}

.stat-fill.hp {
  background: #8b3a3a;
}

.stat-fill.san {
  background: #3a5c8b;
}

.stat-value {
  font-size: 12px;
  color: var(--text-dim);
}

.attrs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 24px;
}

.attr {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--bg-elevated);
  border-radius: 8px;
  border: 1px solid var(--border);
}

.attr-key {
  font-size: 13px;
  color: var(--text-muted);
}

.attr-val {
  font-weight: 600;
}

.block {
  margin-bottom: 20px;
}

.block-title {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  display: inline-flex;
  flex-direction: column;
  padding: 6px 10px;
  font-size: 12px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: var(--bg-elevated);
  color: var(--text);
}

.tag-campaign {
  border-color: var(--accent-dim);
  color: var(--accent);
}

.tag-story {
  border-color: rgba(100, 140, 180, 0.5);
}

.tag-note {
  font-size: 10px;
  color: var(--text-dim);
  margin-top: 2px;
}

.clue-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.clue-list li {
  font-size: 13px;
  line-height: 1.5;
  padding: 8px 10px;
  background: var(--bg-elevated);
  border-radius: 8px;
  border-left: 3px solid var(--accent-dim);
  color: var(--text-muted);
}

.empty {
  font-size: 13px;
  color: var(--text-dim);
}
</style>
