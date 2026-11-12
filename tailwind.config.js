/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-plus-jakarta)",
          "Plus Jakarta Sans",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        mono: ["var(--font-geist-mono)", "JetBrains Mono", "monospace"],
      },
      colors: {
        canvas: "#FAF7F2",
        ink: {
          DEFAULT: "#3D3A45",
          muted: "#6C6777",
        },
        stroke: "#F0EAE1",
        pastel: {
          cream: "#FAF7F2",
          sky: "#89C2D9",
          lilac: "#E0BBE4",
          mint: "#A8DADC",
          strawberry: "#F8B4C0",
          peach: "#FFE5B4",
          blue: "#EFF6FF",
          blueBorder: "#DBEAFE",
          emerald: "#EBFDF4",
          emeraldBorder: "#D1F7E2",
          amber: "#FEFCE8",
          amberBorder: "#FDE68A",
          rose: "#FFF1F2",
          roseBorder: "#FECDD3",
          purple: "#F3E8FF",
          purpleBorder: "#E9D5FF",
        },
        primary: {
          DEFAULT: "#29657a",
          container: "#89C2D9",
          soft: "#B8EAFF",
        },
      },
      boxShadow: {
        "pastel-sm": "0 4px 20px -2px rgba(108, 103, 119, 0.04)",
        "pastel-md":
          "0 12px 32px -4px rgba(137, 194, 217, 0.14), 0 4px 12px -2px rgba(61, 58, 69, 0.04)",
        "pastel-lg": "0 18px 40px -6px rgba(224, 187, 228, 0.25)",
        "pastel-sky": "0 4px 14px rgba(137, 194, 217, 0.4)",
        "pastel-mint": "0 8px 20px -4px rgba(52, 211, 153, 0.2)",
        "pastel-pink": "0 8px 20px -4px rgba(244, 114, 182, 0.2)",
        "pastel-blue": "0 8px 20px -4px rgba(96, 165, 250, 0.2)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      maxWidth: {
        dashboard: "1440px",
      },
    },
  },
  plugins: [],
};
