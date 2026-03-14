/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f0f0f',
        card: '#1a1a1a',
        'card-hover': '#252525',
        accent: '#dc2626',
        'accent-hover': '#b91c1c',
        text: '#ffffff',
        'text-muted': '#a3a3a3',
      },
    },
  },
  plugins: [],
}
