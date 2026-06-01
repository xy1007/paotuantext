import { onMounted, watch, type Ref } from 'vue'
import type { ThemeConfig } from '../types/chat'

export function useTheme(theme: Ref<ThemeConfig>) {
  function apply() {
    const root = document.documentElement
    const { colors, fonts } = theme.value

    for (const [key, value] of Object.entries(colors)) {
      root.style.setProperty(key, value)
    }
    root.style.setProperty('--font-narrative', fonts.narrative)
    root.style.setProperty('--font-ui', fonts.ui)
    document.title = theme.value.name
  }

  onMounted(apply)
  watch(theme, apply, { deep: true })

  return { apply }
}
