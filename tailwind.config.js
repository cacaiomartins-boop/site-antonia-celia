/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontWeight: { extrabold: "700" },
      colors: {
        gesso: "#F7F4EC",
        tinta: "#16130F",
        vermelhao: "#C42A1D",
        oliva: "#5A6A2B",
        azul: "#12308F",
        beringela: "#3A1A4A",
        ouro: "#C9A24B",
      },
      fontFamily: {
        display: ['"Syne"', "system-ui", "sans-serif"],
        serif: ['"Newsreader"', "Georgia", "serif"],
        assinatura: ['"La Belle Aurore"', "cursive"],
      },
    },
  },
  plugins: [],
};
