<script setup lang="ts">
import { ref } from 'vue'
import type { SceneInfo } from '../../types/chat'

defineProps<{
  scene: SceneInfo
}>()

const collapsed = ref(false)
</script>

<template>
  <div class="scene-panel" :class="{ collapsed }">
    <button class="scene-toggle" @click="collapsed = !collapsed">
      <span class="scene-label">场景</span>
      <span class="scene-title">{{ scene.title }}</span>
      <svg
        class="chevron"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
    <p v-if="!collapsed" class="scene-desc">{{ scene.description }}</p>
  </div>
</template>

<style scoped>
.scene-panel {
  flex-shrink: 0;
  background: var(--bg-scene);
  border-bottom: 1px solid var(--border);
}

.scene-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 14px;
  text-align: left;
}

.scene-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent);
  flex-shrink: 0;
}

.scene-title {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chevron {
  flex-shrink: 0;
  color: var(--text-dim);
  transition: transform 0.2s;
}

.collapsed .chevron {
  transform: rotate(-90deg);
}

.scene-desc {
  padding: 0 14px 12px;
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.6;
}
</style>
