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
        error: 'var(--error)',

        // Map tailwind classes to match our semantic variables for full dark mode support
        slate: {
          50: 'var(--surface)',
          100: 'var(--foreground)',
          200: 'var(--foreground)',
          300: 'var(--foreground)',
          400: 'var(--secondary-text)',
          500: 'var(--secondary-text)',
          600: 'var(--secondary-text)',
          700: 'var(--secondary-text)',
          800: 'var(--surface-border)',
          900: 'var(--surface-border)',
        },
        blue: {
          50: 'var(--surface)',
          100: 'var(--surface)',
          200: 'var(--primary)',
          300: 'var(--primary)',
          400: 'var(--primary)',
          500: 'var(--primary)',
          600: 'var(--primary-hover)',
          700: 'var(--primary-hover)',
        },
        cyan: {
          50: 'var(--surface)',
          100: 'var(--surface)',
          200: 'var(--primary)',
          300: 'var(--primary)',
          400: 'var(--primary)',
          500: 'var(--primary)',
          600: 'var(--primary-hover)',
          700: 'var(--primary-hover)',
        },
        emerald: {
          100: 'var(--surface)',
          400: 'var(--success)',
          500: 'var(--success)',
          600: 'var(--success)',
        },
        rose: {
          100: 'var(--surface)',
          400: 'var(--error)',
          500: 'var(--error)',
          600: 'var(--error)',
        },
        amber: {
          100: 'var(--surface)',
          400: 'var(--warning)',
          500: 'var(--warning)',
          600: 'var(--warning)',
        }
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
