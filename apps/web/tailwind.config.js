/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cs: {
          orange: {
            50: '#fff8f0',
            100: '#ffeedb',
            200: '#ffd9b3',
            300: '#ffbf80',
            400: '#fa9d42',
            500: '#F98513', // Exact User Requested Orange #F98513
            600: '#e0710b',
            700: '#b85705',
            800: '#944407',
            900: '#78380a',
            accent: '#F98513',
          },
          light: {
            50: '#ffffff',
            100: '#f8fafc',
            200: '#f1f5f9',
            300: '#e2e8f0',
            400: '#cbd5e1',
          }
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Arial', 'Helvetica', 'sans-serif'],
        arial: ['Arial', 'Helvetica', 'sans-serif'],
      },
      backgroundImage: {
        'grid-pattern': "radial-gradient(circle, rgba(0, 0, 0, 0.05) 1px, transparent 1px)",
        'orange-gradient': "linear-gradient(135deg, #F98513 0%, #E0710B 100%)",
        'hero-gradient': "radial-gradient(ellipse at top, rgba(249, 133, 19, 0.1), transparent 70%)",
      },
      backgroundSize: {
        'grid': '24px 24px',
      }
    },
  },
  plugins: [],
};
