import { colors, fontFamily } from './src/theme'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors,
      fontFamily: {
        inter: fontFamily,
      },
    },
  },
  plugins: [],
}
