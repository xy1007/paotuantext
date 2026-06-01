<script setup lang="ts">
import type { InvestigatorOption, CampaignStatLabels } from '../../campaigns'

defineProps<{
  title: string
  tagline: string
  intro: string
  prompt: string
  options: InvestigatorOption[]
  statLabels: CampaignStatLabels
}>()

const emit = defineEmits<{
  select: [id: string]
}>()
</script>

<template>
  <div class="select-screen">
    <div class="select-scroll">
      <header class="select-header">
        <p class="tagline">{{ tagline }}</p>
        <h1>{{ title }}</h1>
        <p class="intro">{{ intro }}</p>
      </header>

      <p class="prompt">{{ prompt }}</p>

      <div class="cards">
        <button
          v-for="opt in options"
          :key="opt.id"
          class="card"
          @click="emit('select', opt.id)"
        >
          <span v-if="options.length > 1" class="card-id">{{ opt.id }}</span>
          <div class="card-body">
            <h2>{{ opt.title }}</h2>
            <p class="subtitle">{{ opt.subtitle }}</p>
            <p class="desc">{{ opt.description }}</p>
            <p class="san">
              {{ statLabels.primary }} {{ opt.character.hp }}
              · {{ statLabels.secondary }} {{ opt.character.san }}
            </p>
            <ul class="items">
              <li v-for="item in opt.items" :key="item">{{ item }}</li>
            </ul>
          </div>
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
  -webkit-overflow-scrolling: touch;
  padding: calc(20px + env(safe-area-inset-top, 0)) 16px
    calc(24px + env(safe-area-inset-bottom, 0));
}

.select-header {
  text-align: center;
  margin-bottom: 24px;
}

.tagline {
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--accent);
  margin-bottom: 8px;
}

h1 {
  font-family: var(--font-narrative);
  font-size: 28px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 16px;
}

.intro {
  font-size: 14px;
  line-height: 1.75;
  color: var(--text-muted);
  text-align: left;
  white-space: pre-wrap;
}

.prompt {
  font-size: 13px;
  color: var(--text-dim);
  margin-bottom: 12px;
  text-align: center;
}

.cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card {
  display: flex;
  gap: 12px;
  text-align: left;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--bg-elevated);
}

.card:active {
  border-color: var(--accent);
}

.card-id {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--accent-dim);
  color: var(--accent);
  font-weight: 700;
  font-size: 16px;
}

.card-body h2 {
  font-size: 16px;
  margin-bottom: 2px;
}

.subtitle {
  font-size: 12px;
  color: var(--text-dim);
  margin-bottom: 6px;
}

.desc {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.san {
  font-size: 12px;
  color: var(--accent);
  margin-bottom: 6px;
}

.items {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  list-style: none;
}

.items li {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  background: var(--bg);
  border: 1px solid var(--border);
  color: var(--text-dim);
}
</style>
