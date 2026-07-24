import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

/**
 * Tailwind theme is derived entirely from the design-system tokens in
 * `src/platform/theme/tokens.css`. Colors reference CSS custom properties as
 * space-separated RGB channels (`rgb(var(--token) / <alpha-value>)`) so that
 *   (a) Tailwind opacity utilities keep working, and
 *   (b) a tenant can re-skin the whole console at runtime by overriding the
 *       channel variables — no component or config change required.
 * There is no raw hex here or in feature code; tokens are the single source of truth.
 */
const channel = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: channel("--border"),
        input: channel("--input"),
        ring: channel("--ring"),
        background: channel("--background"),
        foreground: channel("--foreground"),

        hairline: {
          DEFAULT: channel("--border"),
          strong: channel("--input"),
        },
        surface: {
          base: channel("--background"),
          sunken: channel("--surface-sunken"),
          DEFAULT: channel("--surface-1"),
          raised: channel("--surface-2"),
          overlay: channel("--surface-3"),
        },
        text: {
          primary: channel("--text-primary"),
          secondary: channel("--text-secondary"),
          tertiary: channel("--text-tertiary"),
          disabled: channel("--text-disabled"),
        },

        primary: {
          DEFAULT: channel("--primary"),
          foreground: channel("--primary-foreground"),
        },
        secondary: {
          DEFAULT: channel("--secondary"),
          foreground: channel("--secondary-foreground"),
        },
        muted: {
          DEFAULT: channel("--muted"),
          foreground: channel("--muted-foreground"),
        },
        accent: {
          DEFAULT: channel("--accent"),
          foreground: channel("--accent-foreground"),
        },
        card: {
          DEFAULT: channel("--card"),
          foreground: channel("--card-foreground"),
        },
        popover: {
          DEFAULT: channel("--popover"),
          foreground: channel("--popover-foreground"),
        },

        // Brand accent (ice-steel) — reserved for primary / active / focus / brand only.
        brand: {
          DEFAULT: channel("--brand"),
          bright: channel("--brand-bright"),
          strong: channel("--brand-strong"),
          subtle: channel("--brand-subtle"),
          foreground: channel("--brand-foreground"),
        },

        // Semantic signals — distinct from the brand accent.
        success: {
          DEFAULT: channel("--success"),
          foreground: channel("--success-foreground"),
          soft: channel("--success-soft"),
        },
        warning: {
          DEFAULT: channel("--warning"),
          foreground: channel("--warning-foreground"),
          soft: channel("--warning-soft"),
        },
        danger: {
          DEFAULT: channel("--danger"),
          foreground: channel("--danger-foreground"),
          soft: channel("--danger-soft"),
        },
        destructive: {
          DEFAULT: channel("--danger"),
          foreground: channel("--danger-foreground"),
        },
        info: {
          DEFAULT: channel("--info"),
          foreground: channel("--info-foreground"),
          soft: channel("--info-soft"),
        },
        draft: {
          DEFAULT: channel("--draft"),
          foreground: channel("--draft-foreground"),
          soft: channel("--draft-soft"),
        },
      },

      fontFamily: {
        display: ["Bricolage Grotesque Variable", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Hanken Grotesk Variable", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono Variable", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.02em" }],
        xs: ["0.75rem", { lineHeight: "1.1rem" }],
        sm: ["0.8125rem", { lineHeight: "1.25rem" }],
        base: ["0.875rem", { lineHeight: "1.4rem" }],
        md: ["0.9375rem", { lineHeight: "1.5rem" }],
        lg: ["1.0625rem", { lineHeight: "1.6rem" }],
        xl: ["1.25rem", { lineHeight: "1.7rem", letterSpacing: "-0.01em" }],
        "2xl": ["1.5rem", { lineHeight: "1.9rem", letterSpacing: "-0.015em" }],
        "3xl": ["1.875rem", { lineHeight: "2.2rem", letterSpacing: "-0.02em" }],
        "4xl": ["2.375rem", { lineHeight: "2.6rem", letterSpacing: "-0.022em" }],
        "5xl": ["3rem", { lineHeight: "3.1rem", letterSpacing: "-0.024em" }],
      },
      borderRadius: {
        none: "0",
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius-md)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        full: "9999px",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow-md)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        glow: "var(--glow-brand)",
        none: "none",
      },
      transitionTimingFunction: {
        DEFAULT: "var(--ease)",
        swift: "var(--ease-swift)",
        out: "var(--ease-out)",
      },
      transitionDuration: {
        fast: "var(--dur-fast)",
        DEFAULT: "var(--dur-base)",
        slow: "var(--dur-slow)",
      },
      keyframes: {
        "rise-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "rise-in": "rise-in var(--dur-slow) var(--ease-out) both",
        "fade-in": "fade-in var(--dur-base) var(--ease) both",
        shimmer: "shimmer 1.6s var(--ease) infinite",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
