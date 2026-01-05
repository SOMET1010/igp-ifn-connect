import type { Config } from "tailwindcss";
import { PNAVIM_HSL } from "./src/styles/design-tokens";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // ============================================
        // PNAVIM DESIGN SYSTEM (Source unique)
        // ============================================
        pnavim: {
          primary: `hsl(${PNAVIM_HSL.primary})`,
          secondary: `hsl(${PNAVIM_HSL.secondary})`,
          background: `hsl(${PNAVIM_HSL.background})`,
          surface: `hsl(${PNAVIM_HSL.surface})`,
          foreground: `hsl(${PNAVIM_HSL.foreground})`,
          muted: `hsl(${PNAVIM_HSL.muted})`,
          destructive: `hsl(${PNAVIM_HSL.destructive})`,
          warning: `hsl(${PNAVIM_HSL.warning})`,
          border: `hsl(${PNAVIM_HSL.border})`,
        },
        
        // ============================================
        // SHADCN/UI VARIABLES (Requis pour les composants)
        // ============================================
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
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "calc(var(--radius) + 16px)",
      },
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
        "xxl": ["1.375rem", { lineHeight: "1.75rem" }],
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
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
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "bounce-gentle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(1.5)", opacity: "0" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up-bounce": {
          "0%": { 
            opacity: "0", 
            transform: "translateY(30px) scale(0.95)" 
          },
          "60%": { 
            opacity: "1", 
            transform: "translateY(-5px) scale(1.02)" 
          },
          "80%": { 
            transform: "translateY(2px) scale(0.99)" 
          },
          "100%": { 
            opacity: "1", 
            transform: "translateY(0) scale(1)" 
          },
        },
        "confetti-fall": {
          "0%": { 
            transform: "translateY(0) rotate(0deg)", 
            opacity: "1" 
          },
          "100%": { 
            transform: "translateY(100vh) rotate(720deg)", 
            opacity: "0" 
          },
        },
        "fade-pulse": {
          "0%, 100%": {
            opacity: "1",
            transform: "scale(1)"
          },
          "50%": {
            opacity: "0.7",
            transform: "scale(1.05)"
          }
        },
        "audio-bar": {
          "0%, 100%": { height: "0.5rem" },
          "50%": { height: "0.875rem" }
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "bounce-gentle": "bounce-gentle 2s infinite",
        "pulse-ring": "pulse-ring 1.5s infinite",
        "slide-up": "slide-up 0.4s ease-out forwards",
        "slide-up-bounce": "slide-up-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "confetti-fall": "confetti-fall 2.5s ease-out forwards",
        "fade-pulse": "fade-pulse 3s ease-in-out infinite",
        "audio-bar": "audio-bar 0.5s ease-in-out infinite",
      },
      boxShadow: {
        // ============================================
        // PNAVIM SHADOWS (Source unique)
        // ============================================
        "pnavim-primary": "0 10px 40px -10px hsl(var(--primary) / 0.3)",
        "pnavim-secondary": "0 10px 40px -10px hsl(var(--secondary) / 0.3)",
        "pnavim-warning": "0 10px 40px -10px hsl(var(--warning) / 0.3)",
        "pnavim-muted": "0 20px 40px -15px hsl(var(--muted-foreground) / 0.2)",
        // XL variants
        "pnavim-xl-primary": "0 20px 60px -15px hsl(var(--primary) / 0.4)",
        "pnavim-xl-secondary": "0 20px 60px -15px hsl(var(--secondary) / 0.4)",
        // Effets GLOW avec halo lumineux
        "glow-primary": "0 0 25px hsl(var(--primary) / 0.5), 0 0 50px hsl(var(--primary) / 0.3), 0 10px 30px -10px hsl(var(--primary) / 0.4)",
        "glow-secondary": "0 0 25px hsl(var(--secondary) / 0.5), 0 0 50px hsl(var(--secondary) / 0.3), 0 10px 30px -10px hsl(var(--secondary) / 0.4)",
        "glow-warning": "0 0 25px hsl(var(--warning) / 0.5), 0 0 50px hsl(var(--warning) / 0.3), 0 10px 30px -10px hsl(var(--warning) / 0.4)",
        "glow-muted": "0 0 20px hsl(var(--muted-foreground) / 0.25), 0 0 40px hsl(var(--muted-foreground) / 0.15)",
        "glow-destructive": "0 0 15px hsl(var(--destructive) / 0.6), 0 0 30px hsl(var(--destructive) / 0.4), 0 0 45px hsl(var(--destructive) / 0.2)",
        // Legacy aliases (pour compatibilité temporaire)
        "africa": "0 10px 40px -10px hsl(var(--primary) / 0.3)",
        "forest": "0 10px 40px -10px hsl(var(--secondary) / 0.3)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
