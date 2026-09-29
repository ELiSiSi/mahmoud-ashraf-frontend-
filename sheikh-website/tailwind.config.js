/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg)",
        card: "var(--card)",
        text: "var(--text)",
        muted: "var(--muted)",
        border: "var(--border)",
        primary: {
          DEFAULT: "var(--primary)",
          light: "var(--primary-light)",
          lighter: "var(--primary-lighter)",
        },
        gold: {
          DEFAULT: "var(--gold)",
          light: "var(--gold-light)",
          bg: "var(--gold-bg)",
        }
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
        amiri: ['Amiri', 'serif'],
        reem: ['"Reem Kufi"', 'sans-serif'],
        qahiri: ['Qahiri', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
