import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Monochromatic color palette - black, white, and grayscale only
        primary: '#000000',      // Pure black
        secondary: '#ffffff',    // Pure white
        gray: {
          50: '#f9f9f9',        // Lightest gray
          100: '#f5f5f5',       // Light gray backgrounds
          200: '#e5e5e5',       // Light borders
          300: '#d4d4d4',       // Medium light
          400: '#a3a3a3',       // Medium
          500: '#737373',       // Medium gray text
          600: '#525252',       // Dark medium
          700: '#404040',       // Dark
          800: '#262626',       // Very dark
          900: '#171717',       // Almost black
        },
        error: '#444444',        // Dark gray for errors
        success: '#222222',      // Very dark gray for success
        border: '#e5e5e5',      // Default border color
        input: '#ffffff',       // Input background
        ring: '#000000',        // Focus ring color
        background: '#ffffff',   // Page background
        foreground: '#000000',  // Text color
      },
      fontFamily: {
        sans: ['Arial', 'Helvetica', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      fontSize: {
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '24px' }],
        lg: ['18px', { lineHeight: '28px' }],
        xl: ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '40px' }],
      },
      spacing: {
        // Consistent spacing system based on 4px units
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
        '32': '128px',
      },
      borderRadius: {
        none: '0px',
        sm: '2px',
        DEFAULT: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        none: 'none',
      },
    },
  },
  plugins: [],
}

export default config