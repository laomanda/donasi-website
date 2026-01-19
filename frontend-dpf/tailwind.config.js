/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // BRAND DPF
        primary: {
          50:  "#fff7e6",
          100: "#ffebbf",
          200: "#ffd68a",
          300: "#ffbf4d",
          400: "#ffa826",
          500: "#ff8a00", // oranye utama (CTA)
          600: "#f97316",
          700: "#ea580c",
          800: "#c2410c",
          900: "#9a3412",
        },
        brandGreen: {
          50:  "#f3faf3",
          100: "#e1f4e1",
          200: "#bde4bd",
          300: "#8fcd8f",
          400: "#5fab5f",
          500: "#3f8f3f", // hijau logo
          600: "#347334",
          700: "#295a29",
          800: "#1f4220",
          900: "#152d16",
        },
      },
      fontFamily: {
        // Poppins sebagai font utama.
        heading: ["Poppins", "system-ui", "sans-serif"],
        body: ["Poppins", "system-ui", "sans-serif"],
        accent: ["Poppins", "system-ui", "sans-serif"],
        sans: ["Poppins", "system-ui", "sans-serif"],
      },
      container: {
        center: true,
        padding: "1rem",
        screens: {
          sm: "640px",
          md: "768px",
          lg: "1024px",
          xl: "1280px",
          "2xl": "1440px",
        },
      },
      borderRadius: {
        "xl": "0.9rem",
        "2xl": "1.2rem",
      },
      boxShadow: {
        soft: "0 18px 45px rgba(15, 23, 42, 0.06)", 
      },
    },
  },
  plugins: [],
};
