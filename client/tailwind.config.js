/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      fontSize: {
        h1: "clamp(2.44rem, calc(2.05rem + 1.93vw), 3.55rem)",
        h2: "clamp(1.95rem, calc(1.71rem + 1.24vw), 2.66rem)",
        h3: "clamp(1.56rem, calc(1.41rem + 0.76vw), 2rem)",
        h4: "clamp(1.25rem, calc(1.16rem + 0.43vw), 1.5rem)",
        body: "clamp(1rem, calc(0.96rem + 0.22vw), 1.13rem)",
      },
      colors: {
        dark: "#2e0249",
        light: "#f806cc",
        "purple-dark": "#570a57",
        "purple-light": "#a91079",
        "firefox-purple": "#7b5aed",
        "firefox-blue": "#bd3be7",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
