/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#6366f1",
                    hover: "#4f46e5",
                    light: "#818cf8"
                },
                background: {
                    dark: "#0f172a",
                    card: "#1e293b"
                },
                accent: "#22d3ee",
            },
            backdropBlur: {
                xs: '2px',
            }
        },
    },
    plugins: [],
}
