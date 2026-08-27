/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        surface: 'var(--surface)',
        surfaceBorder: 'var(--surface-border)',
        primary: 'var(--primary)',
        primaryHover: 'var(--primary-hover)',
        foreground: 'var(--foreground)',
        secondaryText: 'var(--secondary-text)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        error: 'var(--error)'
      },
      borderRadius: {
        'lg': '10px',
        'xl': '12px',
        '2xl': '14px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(25, 25, 25, 0.05)',
        'md': '0 4px 6px -1px rgba(25, 25, 25, 0.05), 0 2px 4px -1px rgba(25, 25, 25, 0.03)',
        'lg': '0 10px 15px -3px rgba(25, 25, 25, 0.05), 0 4px 6px -2px rgba(25, 25, 25, 0.03)',
        'xl': '0 20px 25px -5px rgba(25, 25, 25, 0.05), 0 10px 10px -5px rgba(25, 25, 25, 0.03)',
        '2xl': '0 25px 50px -12px rgba(25, 25, 25, 0.08)',
      }
    },
  },
  plugins: [],
}
