// Custom coffee-themed color palette for tailwind
module.exports = {
  extend: {
    colors: {
      coffee: {
        light: '#E6D7C3', // Light cream
        cream: '#D0B49F', // Coffee with cream
        medium: '#A67C52', // Medium roast
        dark: '#6F4E37',  // Dark roast
        espresso: '#3B2D23', // Rich espresso
        accent: '#BF4E30', // Cinnamon/red accent
      },
    },
    fontFamily: {
      sans: ['Poppins', 'Helvetica', 'Arial', 'sans-serif'],
      display: ['Quicksand', 'Helvetica', 'Arial', 'sans-serif'],
    },
    boxShadow: {
      'coffee': '0 4px 10px rgba(111, 78, 55, 0.1)',
      'coffee-hover': '0 6px 15px rgba(111, 78, 55, 0.15)',
    },
    animation: {
      'steam': 'steam 2s ease-in-out infinite',
    },
    keyframes: {
      steam: {
        '0%, 100%': { transform: 'translateY(0) scale(1)' },
        '50%': { transform: 'translateY(-8px) scale(1.2)' },
      }
    }
  },
};