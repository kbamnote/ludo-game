/**
 * Mirrors the Tailwind config embedded in the Google Stitch screens, so class
 * names copied from the Stitch HTML resolve identically here.
 *
 *   bg-surface-container-high   text-primary-container   font-label-sm
 *   px-margin                   gap-space-xs             rounded-xl
 *
 * Phase 2 then becomes largely transliteration rather than reinterpretation.
 * Keep this in sync with src/theme/* — they are two views of one token set.
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './src/**/*.{js,jsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Material roles, verbatim from the Stitch config ────────────────
        background: '#121318',
        'on-background': '#e3e1e9',

        surface: '#121318',
        'surface-dim': '#121318',
        'surface-bright': '#38393f',
        'surface-variant': '#34343a',
        'surface-tint': '#00e478',
        'surface-container-lowest': '#0d0e13',
        'surface-container-low': '#1a1b21',
        'surface-container': '#1e1f25',
        'surface-container-high': '#292a2f',
        'surface-container-highest': '#34343a',
        'on-surface': '#e3e1e9',
        'on-surface-variant': '#b9cbb9',
        'inverse-surface': '#e3e1e9',
        'inverse-on-surface': '#2f3036',

        outline: '#849585',
        'outline-variant': '#3b4b3d',

        primary: '#f1ffef',
        'on-primary': '#003919',
        'primary-container': '#00ff87',
        'on-primary-container': '#007138',
        'inverse-primary': '#006d36',
        'primary-fixed': '#60ff98',
        'primary-fixed-dim': '#00e478',
        'on-primary-fixed': '#00210c',
        'on-primary-fixed-variant': '#005227',

        secondary: '#d3fbff',
        'on-secondary': '#00363a',
        'secondary-container': '#00eefc',
        'on-secondary-container': '#00686f',
        'secondary-fixed': '#7df4ff',
        'secondary-fixed-dim': '#00dbe9',
        'on-secondary-fixed': '#002022',
        'on-secondary-fixed-variant': '#004f54',

        tertiary: '#fffafa',
        'on-tertiary': '#66002c',
        'tertiary-container': '#ffd4dc',
        'on-tertiary-container': '#c2005b',
        'tertiary-fixed': '#ffd9e0',
        'tertiary-fixed-dim': '#ffb1c3',
        'on-tertiary-fixed': '#3f0019',
        'on-tertiary-fixed-variant': '#8f0041',

        error: '#ffb4ab',
        'on-error': '#690005',
        'error-container': '#93000a',
        'on-error-container': '#ffdad6',

        // ── Brand additions not present in the generated screens ──────────
        // The true base canvas, below `surface`.
        void: '#0A0B10',
        // The four factions, per the WRITTEN design system (see colors.js).
        'faction-p1': '#00FF87',
        'faction-p2': '#00F0FF',
        'faction-p3': '#FF007A',
        'faction-p4': '#8B5CF6',
        // Perceptual solids standing in for backdrop-blur (see effects.js).
        'glass-void': '#15171f',
        'glass-surface': '#191b24',
        'glass-container': '#1f2129',
        'glass-container-high': '#262832',
      },

      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px',
      },

      spacing: {
        margin: '1rem',
        gutter: '0.75rem',
        'space-xs': '0.25rem',
        'space-sm': '0.5rem',
        'space-md': '0.875rem',
        'space-lg': '1.25rem',
        'space-xl': '1.75rem',
      },

      fontFamily: {
        'display-hero': ['Syne_800ExtraBold'],
        'headline-lg': ['Syne_700Bold'],
        'headline-md': ['Syne_700Bold'],
        'headline-sm': ['Syne_600SemiBold'],
        'body-lg': ['PlusJakartaSans_500Medium'],
        'body-md': ['PlusJakartaSans_400Regular'],
        'body-sm': ['PlusJakartaSans_400Regular'],
        'label-lg': ['PlusJakartaSans_700Bold'],
        'label-md': ['PlusJakartaSans_700Bold'],
        'label-sm': ['PlusJakartaSans_800ExtraBold'],
        icons: ['MaterialSymbolsOutlined'],
      },

      fontSize: {
        'display-hero': ['40px', { lineHeight: '44px', letterSpacing: '-1.2px' }],
        'headline-lg': ['30px', { lineHeight: '36px', letterSpacing: '-0.6px' }],
        'headline-md': ['22px', { lineHeight: '28px', letterSpacing: '-0.22px' }],
        'headline-sm': ['18px', { lineHeight: '24px' }],
        'body-lg': ['16px', { lineHeight: '24px' }],
        'body-md': ['14px', { lineHeight: '20px' }],
        'body-sm': ['12px', { lineHeight: '16px' }],
        'label-lg': ['14px', { lineHeight: '18px', letterSpacing: '0.56px' }],
        'label-md': ['11px', { lineHeight: '14px', letterSpacing: '0.88px' }],
        'label-sm': ['10px', { lineHeight: '12px', letterSpacing: '1px' }],
      },
    },
  },
  plugins: [],
};
