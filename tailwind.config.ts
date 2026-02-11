import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#8c2bee",
                    light: "#a352f1",
                    dark: "#6a1cb5",
                    50: "#f3e8ff",
                    100: "#e9d5ff",
                    200: "#d8b4fe",
                    300: "#c084fc",
                    400: "#a855f7",
                    500: "#8c2bee", // Base
                    600: "#7e22ce",
                    700: "#6b21a8",
                    800: "#581c87",
                    900: "#4c1d95",
                },
                background: {
                    light: "#f7f6f8",
                    dark: "#191022",
                },
                surface: {
                    light: "#ffffff",
                    dark: "#2d1f3f",
                },
            },
            fontFamily: {
                display: ["var(--font-manrope)", "sans-serif"],
            },
            borderRadius: {
                lg: "1rem",
                xl: "1.5rem",
                "2xl": "2rem",
                "3xl": "2.5rem",
            },
            boxShadow: {
                soft: "0 20px 40px -15px rgba(140, 43, 238, 0.15)",
                glow: "0 0 60px -15px rgba(140, 43, 238, 0.3)",
                glass: "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
            },
            animation: {
                blob: "blob 7s infinite",
            },
            keyframes: {
                blob: {
                    "0%": {
                        transform: "translate(0px, 0px) scale(1)",
                    },
                    "33%": {
                        transform: "translate(30px, -50px) scale(1.1)",
                    },
                    "66%": {
                        transform: "translate(-20px, 20px) scale(0.9)",
                    },
                    "100%": {
                        transform: "translate(0px, 0px) scale(1)",
                    },
                },
            },
        },
    },
    plugins: [require("tailwindcss-animate"), require("@tailwindcss/forms")],
};
export default config;
