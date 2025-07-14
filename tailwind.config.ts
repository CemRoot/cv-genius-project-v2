import type { Config } from "tailwindcss";

export default {
  // Dark mode disabled - only light mode supported
  // darkMode: ["class"], // REMOVED - Dark mode completely disabled
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
      // Touch-friendly spacing scale
      spacing: {
        'touch': '44px',
        'touch-lg': '56px',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      // Mobile-first font sizes
      fontSize: {
        'mobile-xs': ['0.75rem', { lineHeight: '1rem' }],
        'mobile-sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'mobile-base': ['1rem', { lineHeight: '1.5rem' }],
        'mobile-lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'mobile-xl': ['1.25rem', { lineHeight: '1.75rem' }],
        'mobile-2xl': ['1.5rem', { lineHeight: '2rem' }],
        'mobile-3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      },
      // Mobile viewport heights
      height: {
        'mobile-screen': 'calc(var(--vh, 1vh) * 100)',
        'mobile-screen-small': 'calc(var(--vh, 1vh) * 50)',
        'mobile-screen-large': 'calc(var(--vh, 1vh) * 150)',
      },
      minHeight: {
        'mobile-screen': 'calc(var(--vh, 1vh) * 100)',
        'touch': '44px',
        'touch-lg': '56px',
      },
      maxHeight: {
        'mobile-screen': 'calc(var(--vh, 1vh) * 100)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Mobile touch feedback animations
        "touch-feedback": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(0.98)" },
          "100%": { transform: "scale(1)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "touch-feedback": "touch-feedback 0.15s ease-out",
        "fade-in-up": "fade-in-up 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;