/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        page: 'var(--bg-page)',
        'page-alt': 'var(--bg-page-alt)',
        card: 'var(--bg-card)',
        'card-alt': 'var(--bg-card-alt)',
        theme: 'var(--border)',
        accent: 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        'accent-bg': 'var(--accent-bg)',
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
        disabled: 'var(--text-disabled)',
        'danger-c': 'var(--danger)',
        'danger-bg-c': 'var(--danger-bg)',
        'danger-border-c': 'var(--danger-border)',
        'warning-c': 'var(--warning)',
        'warning-bg-c': 'var(--warning-bg)',
        'warning-border-c': 'var(--warning-border)',
        'success-c': 'var(--success)',
        'success-bg-c': 'var(--success-bg)',
        'success-border-c': 'var(--success-border)',
        'safe-bg-c': 'var(--safe-bg)',
      },
    },
  },
  plugins: [],
};
