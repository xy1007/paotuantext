<script setup lang="ts">
import type { ActionSuggestion } from '../../types/chat'

const props = defineProps<{
  suggestions: ActionSuggestion[]
  enabled?: boolean
  chosenSuggestionId?: string
}>()

const emit = defineEmits<{
  select: [suggestionId: string, action: string]
}>()

const locked = () => Boolean(props.chosenSuggestionId)

function chipDisabled(): boolean {
  return !props.enabled || locked()
}

function chipClass(sug: ActionSuggestion): Record<string, boolean> {
  return {
    chosen: props.chosenSuggestionId === sug.id,
    muted: locked() && props.chosenSuggestionId !== sug.id,
  }
}
</script>

<template>
  <div class="action-chips" :class="{ locked: locked() }">
    <button
      v-for="sug in suggestions"
      :key="sug.id"
      type="button"
      class="chip"
      :class="chipClass(sug)"
      :disabled="chipDisabled()"
      @click="emit('select', sug.id, sug.action)"
    >
      {{ sug.label }}
    </button>
  </div>
</template>

<style scoped>
.action-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  padding: 0 2px;
}

.action-chips.locked .chip {
  pointer-events: none;
}

.chip {
  flex-shrink: 0;
  padding: 8px 14px;
  font-size: 13px;
  line-height: 1.3;
  border-radius: 18px;
  border: 1px solid var(--accent-dim);
  background: var(--bg-elevated);
  color: var(--accent);
  text-align: left;
  max-width: 100%;
}

.chip.chosen {
  border-color: var(--accent);
  background: var(--accent-dim);
  color: var(--text);
  opacity: 1;
}

.chip.muted,
.chip:disabled:not(.chosen) {
  opacity: 0.4;
  cursor: default;
}

.chip:active:not(:disabled) {
  background: var(--accent-dim);
  color: var(--text);
  border-color: var(--accent);
}
</style>
