const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  content: ["./src/index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        "ss-default": "4px 4px 0px 0px rgba(24, 23, 16, 0.90)",
        "ss-active": "2px 2px 0px 0px rgba(24, 23, 16, 0.90)",
        "ss-small": "2px 2px 0px 0px rgba(24, 23, 16, 0.90)",
        "ss-small-active": "1px 1px 0px 0px rgba(24, 23, 16, 0.90)",
      },
    },

    colors: {
      ...colors,

      transparent: "transparent",
      "ss-white": "#FFFFFF",
      "ss-divider-stroke": "rgba(255, 255, 255, 0.2)",
      "ss-blue": "#8CBEEF",
      "ss-blue-hover": "#67A9EA",
      "ss-gold": "#E6D089",
      "ss-gold-hover": "#E0C56C",
      "ss-bg-0": "#F4F3F1",
      "ss-bg-1": "#F1EDE4",
      "ss-bg-2": "#E6E1D6",
      "ss-stroke": "#DDDAD0",
      "ss-warning": "#BF1818",
      "ss-text-highlight": "1F80E0",
      "ss-text-default": "#25241D",
      "ss-text-light": "#5D5D4C",
      "ss-text-x-light": "#7E7E6D",
      "ss-text-link": "#A28010",
      "ss-text-link-hover": "#66510A",
    },
  },
  plugins: [require("tailwindcss-animate")],
};
