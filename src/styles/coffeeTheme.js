// Custom coffee-themed color palette for tailwind
const coffeeTheme = {
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
      'coffee-dark': '0 4px 10px rgba(0, 0, 0, 0.3)', // Shadow for dark mode
    },
    animation: {
      'steam': 'steam 2s ease-in-out infinite',
      'slide-in': 'slide-in 0.3s ease-out forwards',
      'slide-out': 'slide-out 0.3s ease-in forwards',
    },
    keyframes: {
      steam: {
        '0%, 100%': { transform: 'translateY(0) scale(1)' },
        '50%': { transform: 'translateY(-8px) scale(1.2)' },
      },
      'slide-in': {
        '0%': { transform: 'translateX(100%)', opacity: 0 },
        '100%': { transform: 'translateX(0)', opacity: 1 },
      },
      'slide-out': {
        '0%': { transform: 'translateX(0)', opacity: 1 },
        '100%': { transform: 'translateX(100%)', opacity: 0 },
      }
    },
    backgroundColor: {
      // Dark mode variants
      dark: {
        primary: '#262020',    // Dark coffee background
        secondary: '#332a26',  // Slightly lighter dark background
        accent: '#BF4E30',     // Same accent color
        surface: '#423832',    // Card/surface background
        hover: '#50443d',      // Hover state
      }
    },
    textColor: {
      // Dark mode text variants
      dark: {
        primary: '#E6D7C3',    // Light text
        secondary: '#D0B49F',  // Secondary text
        muted: '#A67C52',      // Muted/hint text
      }
    },
    borderColor: {
      // Dark mode border variants
      dark: {
        default: '#50443d',
        accent: '#BF4E30',
      }
    }
  },
};

export default coffeeTheme;