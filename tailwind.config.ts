import type { Config } from "tailwindcss";

export default {
  // Dark mode disabled - only light mode supported
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    // Mobile-first breakpoints
    screens: {
      'xs': '375px',
      'sm': '480px',
      'md': '640px',
      'lg': '768px',
      'xl': '1024px',
      '2xl': '1280px',
      '3xl': '1536px',
    },
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        'xs': '1rem',
        'sm': '1.5rem', 
        'md': '2rem',
        'lg': '2.5rem',
        'xl': '3rem',
        '2xl': '4rem',
      },
      screens: {
        'xs': '375px',
        'sm': '480px',
        'md': '640px',
        'lg': '768px',
        'xl': '1024px',
        '2xl': '1280px',
        '3xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        cvgenius: {
          purple: "#8B5CF6",
          "purple-dark": "#7C3AED",
          "purple-light": "#A78BFA",
          primary: "#8B5CF6",
          "primary-dark": "#7C3AED",
          "primary-light": "#A78BFA",
        },
        // Enhanced text colors for better readability
        text: {
          primary: "#111827",
          secondary: "#374151", 
          tertiary: "#6b7280",
          muted: "#9ca3af",
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // Touch-friendly border radius scale
        'touch': '0.75rem',
        'touch-sm': '0.5rem',
        'touch-lg': '1rem',
      },
      // Mobile aspect ratios
      aspectRatio: {
        'mobile': '9/16',
        'mobile-landscape': '16/9',
        'card': '4/3',
        'cv': '8.5/11',
      },
      // Mobile-optimized typography scale
      fontSize: {
        'mobile-xs': ['12px', { lineHeight: '1.4' }],
        'mobile-sm': ['14px', { lineHeight: '1.4' }],
        'mobile-base': ['16px', { lineHeight: '1.5' }],
        'mobile-lg': ['18px', { lineHeight: '1.4' }],
        'mobile-xl': ['20px', { lineHeight: '1.3' }],
        'mobile-2xl': ['24px', { lineHeight: '1.2' }],
        'mobile-3xl': ['30px', { lineHeight: '1.1' }],
      },
      // Enhanced spacing scale for touch interfaces
      spacing: {
        'touch': '44px',
        'touch-sm': '36px',
        'touch-lg': '52px',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      // Animation and transition improvements
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      // Box shadow optimizations
      boxShadow: {
        'mobile': '0 2px 8px 0 rgba(0, 0, 0, 0.12)',
        'mobile-lg': '0 4px 16px 0 rgba(0, 0, 0, 0.15)',
        'touch': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'elevated': '0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      // Enhanced backdrop blur
      backdropBlur: {
        'xs': '2px',
      },
      // Z-index scale for layering
      zIndex: {
        'modal': '1000',
        'dropdown': '1000',
        'sticky': '40',
        'fixed': '50',
        'popover': '50',
        'tooltip': '60',
      },
      // Grid system enhancements
      gridTemplateColumns: {
        'auto-fit': 'repeat(auto-fit, minmax(0, 1fr))',
        'auto-fill': 'repeat(auto-fill, minmax(0, 1fr))',
        'fluid': 'repeat(auto-fit, minmax(250px, 1fr))',
      },
      // Animation keyframes
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'pulse-slow': 'pulse-slow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Custom plugin for enhanced mobile utilities
    function({ addUtilities, theme }: any) {
      const newUtilities = {
        '.touch-manipulation': {
          'touch-action': 'manipulation',
        },
        '.safe-area-inset': {
          'padding-top': 'env(safe-area-inset-top)',
          'padding-right': 'env(safe-area-inset-right)',
          'padding-bottom': 'env(safe-area-inset-bottom)',
          'padding-left': 'env(safe-area-inset-left)',
        },
        '.text-balance': {
          'text-wrap': 'balance',
        },
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        // Enhanced text readability utilities
        '.text-readable': {
          color: '#111827',
          'line-height': '1.6',
        },
        '.text-readable-secondary': {
          color: '#374151',
          'line-height': '1.5',
        },
        '.text-readable-muted': {
          color: '#6b7280',
          'line-height': '1.5',
        },
      }
      addUtilities(newUtilities)
    },
  ],
} satisfies Config