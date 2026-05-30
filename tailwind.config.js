/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif"
        ]
      },
      colors: {
        leaf: {
          50: "#f2faf2",
          100: "#dff3df",
          200: "#bfe5c1",
          300: "#91d098",
          400: "#60b46d",
          500: "#3f9850",
          600: "#2e7a3e",
          700: "#275f34",
          800: "#224c2d",
          900: "#1d3f27"
        },
        sun: "#f5b85f",
        soil: "#9b6a4f",
        water: "#5ca8c7",
        berry: "#c8667e"
      },
      boxShadow: {
        garden: "0 20px 50px rgba(39, 95, 52, 0.14)",
        soft: "0 12px 35px rgba(63, 93, 78, 0.12)"
      }
    }
  },
  plugins: []
};
