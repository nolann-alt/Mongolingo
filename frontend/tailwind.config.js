/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                duoGreen: '#58cc02',
                duoBlue: '#1cb0f6',
            }
        },
    },
    plugins: [],
}