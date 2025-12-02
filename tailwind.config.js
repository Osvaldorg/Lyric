/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#f9f9f9',
          dark: '#18181b',
        },
        card: {
          DEFAULT: '#ffffff',
          dark: '#27272a',
        },
        primary: {
          DEFAULT: '#8b5cf6',
          dark: '#a78bfa',
        },
        accent: {
          DEFAULT: '#fb923c',
          dark: '#fdba74',
        },
        muted: {
          DEFAULT: '#f3f4f6',
          dark: '#27272a',
          foreground: '#6b7280', // Added for text
        },
        border: {
          DEFAULT: '#e5e7eb',
          dark: '#27272a',
        },
        destructive: '#ef4444',
      },
    },
  },
  plugins: [],
}
