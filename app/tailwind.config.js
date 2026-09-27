/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        iverson: {
          bg: "#02060b",
          panel: "#04121c",
          cyan: "#4ff3ff",
          cyanDim: "#0e6d7a",
          amber: "#ffb238",
          red: "#ff3b3b",
          green: "#38ffb2",
        },
      },
      fontFamily: {
        hud: ["Orbitron", "Rajdhani", "ui-sans-serif", "system-ui"],
        mono: ["Share Tech Mono", "ui-monospace", "SFMono-Regular"],
      },
      keyframes: {
        pulseRing: {
          "0%": { transform: "scale(0.9)", opacity: "0.8" },
          "70%": { transform: "scale(1.4)", opacity: "0" },
          "100%": { transform: "scale(1.4)", opacity: "0" },
        },
        spinSlow: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        spinSlowReverse: {
          from: { transform: "rotate(360deg)" },
          to: { transform: "rotate(0deg)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
      },
      animation: {
        pulseRing: "pulseRing 2.2s cubic-bezier(0.2,0.6,0.4,1) infinite",
        spinSlow: "spinSlow 18s linear infinite",
        spinSlowReverse: "spinSlowReverse 26s linear infinite",
        scan: "scan 3.5s linear infinite",
        flicker: "flicker 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
