/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        // Numbered scale kept for gradients/hero surfaces (e.g. BalanceCard's
        // from-brand-600 to-brand-800). New semantic tokens below are what
        // most components should reach for instead - they resolve to
        // different RGB values per theme via CSS variables (src/style.css),
        // so a component using them needs no separate `dark:` variant.
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },

        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-alt': 'rgb(var(--color-surface-alt) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        ink: 'rgb(var(--color-text) / <alpha-value>)',
        muted: 'rgb(var(--color-text-muted) / <alpha-value>)',

        accent: 'rgb(var(--color-brand) / <alpha-value>)',
        'accent-strong': 'rgb(var(--color-brand-strong) / <alpha-value>)',

        income: 'rgb(var(--color-income) / <alpha-value>)',
        'income-soft': 'rgb(var(--color-income-soft) / <alpha-value>)',
        expense: 'rgb(var(--color-expense) / <alpha-value>)',
        'expense-soft': 'rgb(var(--color-expense-soft) / <alpha-value>)',
        transfer: 'rgb(var(--color-transfer) / <alpha-value>)',
        'transfer-soft': 'rgb(var(--color-transfer-soft) / <alpha-value>)',
        warning: 'rgb(var(--color-warning) / <alpha-value>)',
        'warning-soft': 'rgb(var(--color-warning-soft) / <alpha-value>)',
        danger: 'rgb(var(--color-danger) / <alpha-value>)',
        'danger-soft': 'rgb(var(--color-danger-soft) / <alpha-value>)',

        // Card/invoice/bill lifecycle - distinct from the transaction-type
        // tokens above even where the hue overlaps, so the two concepts
        // (what kind of money movement vs. where a bill/invoice stands)
        // can be recolored independently later.
        'status-upcoming': 'rgb(var(--status-upcoming) / <alpha-value>)',
        'status-due': 'rgb(var(--status-due) / <alpha-value>)',
        'status-overdue': 'rgb(var(--status-overdue) / <alpha-value>)',
        'status-paid': 'rgb(var(--status-paid) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
