/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    screens: {
      xs: '360px',
      md: '768px',
      lg: '1024px',
      xl: '1440px',
    },
    colors: {
      transparent: colors.transparent,
      white: colors.white,
      black: colors.black,
      red: '#ff0000',
      green: '#008000',
      'blue-50': '#eff6ff',
      'blue-200': '#bfdbfe',
      'blue-700': '#1d4ed8',
      'blue-dark': '#1b1c3a',
      'stone-300': '#d6d3d1',
    },
    extend: {
      width: {
        125: '31.25rem',
        175: '43.75rem',
        '144%': '144%',
        'full+6px': 'calc(100% + 6px)',
        'full+20px': 'calc(100% + 20px)',
        'full+50px': 'calc(100% + 50px)',
        'full+90px': 'calc(100% + 90px)',
        '85vw': '85vw',
      },
      minWidth: {
        30: '7.5rem',
      },
      maxWidth: {
        105: '26.25rem',
        37.5: '9.375rem',
        80: '20rem',
        100: '25rem',
        125: '31.25rem',
        480: '120rem',
        '100vw-40px': 'calc(100vw - 40px)',
      },
      height: {
        125: '31.25rem',
      },
      minHeight: {
        '100vh': '100vh',
      },
      spacing: {
        5.5: '1.375rem',
        8.5: '2.125rem',
        12.5: '3.125rem',
        15: '3.75rem',
        17.5: '4.375rem',
        18: '4.5rem',
        18.5: '4.625rem',
      },
      zIndex: {
        1: 1,
        21: 21,
      },
      backgroundColor: {
        '000-0.7': 'rgba(0, 0, 0, 0.7)',
      },
      lineHeight: {
        6.5: '1.625rem',
      },
    },
  },
  plugins: [],
};
