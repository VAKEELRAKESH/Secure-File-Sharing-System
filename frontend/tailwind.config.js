/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F0EEE6',      // warm cream main bg
        surface: '#FAF8F3',         // secondary bg for cards/panels
        surfaceBorder: '#DDD8CF',   // borders and dividers
        primary: '#C96442',         // terracotta
        primaryHover: '#B35537',    // hover
        foreground: '#191919',      // soft black primary text
        secondaryText: '#6B6B6B',   // secondary text
        success: '#4F7A5B',
        warning: '#C98A2E',
        error: '#B84A3A',

        // Map tailwind classes to match our Claude colors so we don't break existing components
        slate: {
          50: '#FAF8F3',
          100: '#191919',
          200: '#191919',
          300: '#222222',
          400: '#6B6B6B',
          500: '#6B6B6B',
          600: '#6B6B6B',
          700: '#6B6B6B',
          800: '#DDD8CF',
          900: '#DDD8CF',
        },
        blue: {
          50: '#FAF8F3',
          100: '#FAF8F3',
          200: '#C96442',
          300: '#C96442',
          400: '#C96442',
          500: '#C96442',
          600: '#B35537',
          700: '#A44D30',
        },
        cyan: {
          50: '#FAF8F3',
          100: '#FAF8F3',
          200: '#C96442',
          300: '#C96442',
          400: '#C96442',
          500: '#C96442',
          600: '#B35537',
          700: '#A44D30',
        },
        emerald: {
          100: '#FAF8F3',
          400: '#4F7A5B',
          500: '#4F7A5B',
          600: '#3E6148',
        },
        rose: {
          100: '#FAF8F3',
          400: '#B84A3A',
          500: '#B84A3A',
          600: '#9C3D2F',
        },
        amber: {
          100: '#FAF8F3',
          400: '#C98A2E',
          500: '#C98A2E',
          600: '#AA7323',
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
