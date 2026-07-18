/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#F8F5EF",      // page background
        beige: "#EFE7D9",      // panels / cards
        "beige-dark": "#DFD3B8", // borders / dividers
        sand: "#C9B896",        // secondary accent
        clay: "#8A7250",        // primary accent / buttons
        ink: "#2B2620",          // primary text
        "ink-soft": "#6E655A",  // secondary text
      },
      fontFamily: {
        display: ["Georgia", "'Times New Roman'", "serif"],
        body: ["'Helvetica Neue'", "Arial", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 20px rgba(43, 38, 32, 0.06)",
        card: "0 1px 3px rgba(43, 38, 32, 0.08)",
      },
      borderRadius: {
        sm: "4px",
      },
    },
  },
  plugins: [],
};
