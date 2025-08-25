import { } from "expo-fo"
import { colors } from "./src/theme/colors"
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors,
      fontFamily: {
        inter: ["Inter_400Regular", "Inter_500Medium", "Inter_700Bold"]
      }
    },
  },
  plugins: [],
}

