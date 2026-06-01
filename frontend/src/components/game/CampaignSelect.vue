<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CampaignDefinition } from '../../campaigns'
import type { SaveSlotMeta } from '../../types/save'

const props = defineProps<{
  list: CampaignDefinition[]
  saveSlots?: SaveSlotMeta[]
}>()

const emit = defineEmits<{
  select: [id: string]
  continue: [slot: number]
}>()

const pickingSlot = ref(false)

const hasSaves = computed(() => props.saveSlots?.some((s) => !s.empty) ?? false)

const filledSlots = computed(() => props.saveSlots?.filter((s) => !s.empty) ?? [])

function formatTime(iso?: string) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}
</script>

<template>
  <div class="select-screen">
    <div class="select-scroll">
      <header class="select-header">
        <p class="tagline">AI 跑团 · 单人模式</p>
        <h1>选择剧本</h1>
        <p class="intro">每个剧本独立世界观与规则，选好后进入角色准备。</p>
      </header>

      <section v-if="hasSaves" class="continue-block">
        <template v-if="!pickingSlot">
          <button type="button" class="continue-btn" @click="pickingSlot = true">
            继续游戏
          </button>
        </template>
        <template v-else>
          <div class="continue-panel">
            <p class="continue-label">选择存档槽位</p>
            <button
              v-for="meta in filledSlots"
              :key="meta.slot"
              type="button"
              class="continue-slot"
              @click="emit('continue', meta.slot)"
            >
              <span class="slot-title">槽位 {{ meta.slot }} · {{ meta.campaignTitle }}</span>
              <span class="slot-sub">{{ meta.characterName }} · {{ formatTime(meta.savedAt) }}</span>
            </button>
            <button type="button" class="continue-cancel" @click="pickingSlot = false">
              取消
            </button>
          </div>
        </template>
      </section>

      <div class="cards">
        <button
          v-for="c in list"
          :key="c.id"
          class="card"
          @click="emit('select', c.id)"
        >
          <div class="card-body">
            <h2>{{ c.title }}</h2>
            <p class="subtitle">{{ c.tagline }}</p>
            <p class="desc">{{ c.introNarrator.split('\n\n')[0] }}</p>
          </div>
          <span class="arrow">›</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.select-screen {
  height: 100%;
  overflow: hidden;
  background: var(--bg);
  max-width: 480px;
  margin: 0 auto;
}

.select-scroll {
  height: 100%;
  overflow-y: auto;
  padding: calc(24px + env(safe-area-inset-top, 0)) 16px
    calc(24px + env(safe-area-inset-bottom, 0));
}

.select-header {
  text-align: center;
  margin-bottom: 28px;
}

.tagline {
  font-size: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 8px;
}

h1 {
  font-family: var(--font-narrative);
  font-size: 26px;
  margin-bottom: 10px;
}

.intro {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.6;
}

.continue-block {
  margin-bottom: 20px;
}

.continue-btn {
  width: 100%;
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid var(--accent);
  background: rgba(var(--accent-rgb, 100, 180, 120), 0.12);
  color: var(--accent);
  font-size: 16px;
  font-weight: 600;
}

.continue-btn:active {
  opacity: 0.85;
}

.continue-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.continue-label {
  font-size: 13px;
  color: var(--text-muted);
  text-align: center;
  margin-bottom: 4px;
}

.continue-slot {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--bg-elevated);
  text-align: left;
}

.continue-slot:active {
  border-color: var(--accent);
}

.slot-title {
  font-size: 14px;
  font-weight: 600;
}

.slot-sub {
  font-size: 12px;
  color: var(--text-muted);
}

.continue-cancel {
  margin-top: 4px;
  font-size: 13px;
  color: var(--text-dim);
  padding: 8px;
}

.cards {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--bg-elevated);
  text-align: left;
}

.card:active {
  border-color: var(--accent);
}

.card-body h2 {
  font-size: 18px;
  margin-bottom: 4px;
}

.subtitle {
  font-size: 12px;
  color: var(--accent-dim);
  margin-bottom: 8px;
}

.desc {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.arrow {
  flex-shrink: 0;
  font-size: 24px;
  color: var(--text-dim);
}
</style>
