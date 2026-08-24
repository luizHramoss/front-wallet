import { useDark, useToggle } from '@vueuse/core'

// Backed by VueUse's useDark: toggles the `.dark` class on <html> (matching
// tailwind.config.js's darkMode: 'class'), persists the choice in
// localStorage, and falls back to the OS preference on first visit.
const isDark = useDark({ storageKey: 'wallet_theme' })
const toggleDark = useToggle(isDark)

export function useTheme() {
  return { isDark, toggleDark }
}
