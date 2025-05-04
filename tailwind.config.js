/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '480px',
      },
      colors: {
        amazon_blue: {
          DEFAULT: '#131921', // Exact Amazon navbar color
          light: '#232F3E',   // Secondary navbar color
          footer: '#232F3E',  // Main footer color
          dark: '#131A22',    // Footer bottom color
        },
        amazon_yellow: {
          DEFAULT: '#FEBD69', // Search bar and buttons
          hover: '#F3A847',   // Hover state
        },
        amazon_orange: {
          DEFAULT: '#FF9900', // Primary orange
          hover: '#FA8900',   // Hover state
        },
        amazon_red: '#B12704', // Price color
        amazon_green: '#007600', // In stock color
        amazon_teal: '#007185', // Link color
        amazon_gray: {
          light: '#F5F5F5',   // Background color
          medium: '#DDDDDD',  // Border color
          dark: '#565959',    // Text color
        }
      },
      fontFamily: {
        amazon: ['Amazon Ember', 'Arial', 'sans-serif']
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}
