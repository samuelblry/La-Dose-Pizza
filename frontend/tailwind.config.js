/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dark: '#1A0200',
        rouge: '#B43024',
        ambre: '#E6A557',
        beige: '#E0BB93',
        creme: '#F4E1CC',
      },
      fontFamily: {
        lostar: ['Lostar', 'serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
