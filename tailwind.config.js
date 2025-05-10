/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',          // Por si usas carpeta `/app` de Next 13+
    './styles/**/*.{css}',                 // Procesa tus estilos globales
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
