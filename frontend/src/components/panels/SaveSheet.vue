<script setup lang="ts">
import { watch } from 'vue'
import type { SaveSlotMeta } from '../../types/save'

const props = defineProps<{
  open: boolean
  slots: SaveSlotMeta[]
  loading: boolean
  busy: boolean
  canSave: boolean
  statusMessage: string | null
}>()

const emit = defineEmits<{
  close: []
  refresh: []
  save: [slot: number]
  load: [slot: number]
  delete: [slot: number]
}>()

watch(
  () => props.open,
  (v) => {
    if (v) emit('refresh')
  },
)

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
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="open" class="sheet-overlay" @click.self="emit('close')">
        <aside class="sheet" role="dialog" aria-label="存档">
          <header class="sheet-header">
            <h2>存档</h2>
            <button class="close-btn" aria-label="关闭" @click="emit('close')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </header>
          <div class="sheet-body">
            <p v-if="statusMessage" class="status">{{ statusMessage }}</p>
            <p v-if="loading" class="hint">加载中…</p>
            <div v-else class="slots">
              <article
                v-for="meta in slots"
                :key="meta.slot"
                class="slot-card"
                :class="{ empty: meta.empty }"
              >
                <div class="slot-head">
                  <span class="slot-num">槽位 {{ meta.slot }}</span>
                  <span v-if="!meta.empty" class="slot-time">{{ formatTime(meta.savedAt) }}</span>
                </div>
                <template v-if="meta.empty">
                  <p class="empty-text">空</p>
                </template>
                <template v-else>
                  <h3>{{ meta.campaignTitle }}</h3>
                  <p class="meta-line">{{ meta.characterName }} · {{ meta.sceneTitle }}</p>
                  <p class="meta-line dim">{{ meta.messageCount }} 条对话</p>
                </template>
                <div class="actions">
                  <button
                    type="button"
                    class="btn primary"
                    :disabled="busy || !canSave"
                    @click="emit('save', meta.slot)"
                  >
                    保存到此
                  </button>
                  <button
                    type="button"
                    class="btn"
                    :disabled="busy || meta.empty"
                    @click="emit('load', meta.slot)"
                  >
                    读取
                  </button>
                  <button
                    type="button"
                    class="btn danger"
                    :disabled="busy || meta.empty"
                    @click="emit('delete', meta.slot)"
                  >
                    删除
                  </button>
                </div>
              </article>
            </div>
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.sheet-overlay {
  position: fixed;
  inset: 0;
  z-index: 110;
  background: var(--shadow);
  display: flex;
  justify-content: flex-end;
}

.sheet {
  width: min(360px, 92vw);
  height: 100%;
  background: var(--sheet-bg);
  border-left: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  padding-top: calc(14px + env(safe-area-inset-top, 0));
  border-bottom: 1px solid var(--border);
}

.sheet-header h2 {
  font-size: 16px;
  font-weight: 600;
}

.close-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: var(--text-muted);
}

.close-btn:active {
  background: var(--bg-elevated);
}

.sheet-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px 24px;
  -webkit-overflow-scrolling: touch;
}

.status {
  font-size: 13px;
  color: var(--accent);
  margin-bottom: 12px;
}

.hint {
  font-size: 14px;
  color: var(--text-muted);
}

.slots {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.slot-card {
  padding: 14px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--bg-elevated);
}

.slot-card.empty {
  opacity: 0.85;
}

.slot-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.slot-num {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent);
}

.slot-time {
  font-size: 11px;
  color: var(--text-dim);
}

.empty-text {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 10px;
}

.slot-card h3 {
  font-size: 15px;
  margin-bottom: 4px;
}

.meta-line {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.4;
}

.meta-line.dim {
  color: var(--text-dim);
  margin-top: 2px;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.btn {
  flex: 1;
  min-width: calc(50% - 4px);
  padding: 8px 10px;
  font-size: 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
  color: var(--text);
  background: var(--bg);
}

.btn:disabled {
  opacity: 0.45;
}

.btn.primary {
  border-color: var(--accent);
  color: var(--accent);
}

.btn.danger {
  color: #c45c5c;
  border-color: rgba(196, 92, 92, 0.4);
}

.btn:active:not(:disabled) {
  background: var(--bg-elevated);
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.25s ease;
}

.sheet-enter-active .sheet,
.sheet-leave-active .sheet {
  transition: transform 0.25s ease;
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-from .sheet,
.sheet-leave-to .sheet {
  transform: translateX(100%);
}
</style>
