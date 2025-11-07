import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  prefix: "",
  // Optimize for production - remove unused styles
  safelist: [
    // Only safelist classes that are dynamically generated
    'dark',
    'light',
    // Background orbs
    'orb',
    'orb-1',
    'orb-2',
    'orb-3',
  ],
  // Disable unused core plugins to reduce CSS size
  corePlugins: {
    // Keep only essential plugins
    preflight: true,
    container: true,
    // Disable all backdrop filters
    backdropBlur: false,
    backdropBrightness: false,
    backdropContrast: false,
    backdropGrayscale: false,
    backdropHueRotate: false,
    backdropInvert: false,
    backdropOpacity: false,
    backdropSaturate: false,
    backdropSepia: false,
    // Disable background utilities
    backgroundImage: false,
    backgroundSize: false,
    backgroundAttachment: false,
    backgroundClip: false,
    // Disable border utilities
    borderCollapse: false,
    borderSpacing: false,
    // Disable box utilities
    boxDecorationBreak: false,
    boxSizing: false,
    // Disable break utilities
    breakAfter: false,
    breakBefore: false,
    breakInside: false,
    // Disable misc utilities
    caretColor: false,
    clear: false,
    columns: false,
    content: false,
    float: false,
    fontVariantNumeric: false,
    isolation: false,
    listStylePosition: false,
    listStyleType: false,
    mixBlendMode: false,
    objectFit: false,
    objectPosition: false,
    // Disable outline utilities
    outlineColor: false,
    outlineOffset: false,
    outlineStyle: false,
    outlineWidth: false,
    // Disable scroll utilities
    overscrollBehavior: false,
    scrollBehavior: false,
    scrollMargin: false,
    scrollPadding: false,
    scrollSnapAlign: false,
    scrollSnapStop: false,
    scrollSnapType: false,
    // Disable placeholder utilities
    placeholderColor: false,
    placeholderOpacity: false,
    // Disable ring utilities (not using focus rings)
    resize: false,
    ringColor: false,
    ringOffsetColor: false,
    ringOffsetWidth: false,
    ringOpacity: false,
    ringWidth: false,
    // Disable table utilities
    tableLayout: false,
    // Disable text decoration utilities
    textDecorationColor: false,
    textDecorationStyle: false,
    textDecorationThickness: false,
    textUnderlineOffset: false,
    // Disable misc
    touchAction: false,
    transformOrigin: false,
    userSelect: false,
    verticalAlign: false,
    visibility: false,
    whitespace: false,
    willChange: false,
    wordBreak: false,
    // Disable more unused utilities
    aspectRatio: false,
    brightness: false,
    contrast: false,
    grayscale: false,
    hueRotate: false,
    invert: false,
    saturate: false,
    sepia: false,
    dropShadow: false,
    blur: false,
  },
  theme: {
    // Limit screen sizes
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    // Limit spacing scale to reduce generated utilities
    spacing: {
      px: '1px',
      0: '0',
      0.5: '0.125rem',
      1: '0.25rem',
      2: '0.5rem',
      3: '0.75rem',
      4: '1rem',
      5: '1.25rem',
      6: '1.5rem',
      8: '2rem',
      10: '2.5rem',
      12: '3rem',
      16: '4rem',
      20: '5rem',
      24: '6rem',
      32: '8rem',
      40: '10rem',
      48: '12rem',
      64: '16rem',
    },
    // Limit font sizes
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    // Limit opacity values
    opacity: {
      0: '0',
      50: '0.5',
      75: '0.75',
      100: '1',
    },
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
  // Limit variants to reduce CSS size
  variants: {
    extend: {},
  },
} satisfies Config;
