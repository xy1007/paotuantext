<script setup lang="ts">
defineProps<{
  title: string
}>()

defineEmits<{
  menu: []
  save: []
}>()
</script>

<template>
  <header class="topbar">
    <button class="icon-btn" aria-label="打开菜单" @click="$emit('menu')">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
    <h1 class="title">{{ title }}</h1>
    <button class="icon-btn" aria-label="存档" @click="$emit('save')">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
      </svg>
    </button>
  </header>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 48px;
  padding: 0 12px;
  padding-top: env(safe-area-inset-top, 0);
  background: var(--topbar-bg);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.title {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  color: var(--text-muted);
}

.icon-btn:active {
  background: var(--bg-elevated);
}
</style>
