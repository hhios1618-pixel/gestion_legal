/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:'#eff9ff',100:'#dff2ff',200:'#b9e6ff',300:'#7fd3ff',
          400:'#3ebeef',500:'#199bd8',600:'#127fba',700:'#106a9a',
          800:'#0f577e',900:'#0e4868',
        },
        ink: {
          50:'#f7f8fa',100:'#eff1f5',200:'#e7eaf0',300:'#d8dfe9',
          400:'#b6c0cf',500:'#8c99ac',600:'#667186',700:'#4a5568',
          800:'#2f3747',900:'#1f2735',
        },
      },
      boxShadow: {
        subtle: '0 1px 2px rgba(16,24,40,.06), 0 1px 3px rgba(16,24,40,.10)',
        card:   '0 2px 8px rgba(16,24,40,.08), 0 10px 20px rgba(16,24,40,.06)',
        focus:  '0 0 0 4px rgba(25,155,216,.15)',
      },
      borderRadius: { xl: '14px' },
      fontFamily: {
        sans: ['ui-sans-serif','system-ui','-apple-system','Segoe UI','Inter','Roboto','Helvetica Neue','Arial','Noto Sans','Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol'],
      },
      transitionTimingFunction: { smooth: 'cubic-bezier(.22,1,.36,1)' },
    },
  },
  plugins: [],
};