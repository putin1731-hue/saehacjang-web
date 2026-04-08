/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream:  "#fdf8f2",
        cream2: "#f9f2e8",
        ivory:  "#fffdf9",
        gold: {
          DEFAULT: "#c8923a",
          light:   "#e0b870",
          pale:    "#f5deb3",
        },
        warm:  "#8b5e3c",
        brownLt: "#c4956a",
      },
      fontFamily: {
        serif:     ['"Noto Serif KR"', 'serif'],
        sans:      ['"Noto Sans KR"', 'sans-serif'],
        cormorant: ['"Cormorant Garamond"', 'serif'],
      },
      spacing: {
        "dropdown": "220px",   // ← min-w-dropdown 으로 사용 가능
      },
      minWidth: {
        "dropdown-sm": "160px",  // 작은 드롭다운
        "dropdown":    "220px",  // 기본 드롭다운  ← 추가
        "dropdown-lg": "280px",  // 큰 드롭다운
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-9px)" },
        },
        fillBar: {
          from: { height: "0%" },
          to:   { height: "100%" },
        },
        slideIn: {
          from: { opacity: 0, transform: "translateX(-8px)" },
          to:   { opacity: 1, transform: "none" },
        },
        fadeUp: {
          from: { opacity: 0, transform: "translateY(28px)" },
          to:   { opacity: 1, transform: "none" },
        },
      },
      animation: {
        float:   "float 4s ease-in-out infinite",
        fillBar: "fillBar 20s linear forwards",
        slideIn: "slideIn 0.4s ease",
        fadeUp:  "fadeUp 0.75s ease forwards",
      },
    },
  },
  plugins: [],
};