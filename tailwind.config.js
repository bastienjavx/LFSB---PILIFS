/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef8ed',
          100: '#dcefcf',
          200: '#cfe8cf',
          500: '#2f7d45',
          600: '#2f7d45',
          700: '#246b3d',
          800: '#195330',
          900: '#123d2a',
          950: '#0b271b',
        },
        ink: '#17231b',
        harvest: {
          accent: '#e9b949',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(23,35,27,0.04), 0 8px 24px rgba(23,35,27,0.07)',
        lift: '0 12px 32px rgba(23,35,27,0.14)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
