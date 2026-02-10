/**
 * Peaks & Pixels - Premium Design System
 * Apple-inspired design tokens and utilities
 */

// =============================================================================
// COLORS - Apple-inspired, dark mode first
// =============================================================================

export const colors = {
    // Backgrounds (layered glass effect)
    background: {
        primary: 'hsl(220, 20%, 4%)',      // Deep space black
        secondary: 'hsl(220, 15%, 8%)',    // Card background
        tertiary: 'hsl(220, 12%, 12%)',    // Elevated elements
        glass: 'hsla(220, 20%, 10%, 0.7)', // Glassmorphism
    },

    // Foregrounds
    foreground: {
        primary: 'hsl(0, 0%, 100%)',       // Pure white
        secondary: 'hsl(220, 10%, 70%)',   // Muted text
        tertiary: 'hsl(220, 10%, 50%)',    // Subtle text
        muted: 'hsl(220, 10%, 35%)',       // Very subtle
    },

    // Borders
    border: {
        primary: 'hsla(220, 15%, 25%, 0.5)',   // Subtle border
        secondary: 'hsla(220, 15%, 20%, 0.3)', // Very subtle
        accent: 'hsla(220, 100%, 70%, 0.3)',   // Blue accent border
    },

    // Brand accent (Premium blue gradient)
    accent: {
        from: 'hsl(210, 100%, 55%)',  // Bright blue
        to: 'hsl(280, 100%, 60%)',    // Purple
        hover: 'hsl(210, 100%, 50%)',
    },

    // Semantic colors
    success: 'hsl(142, 70%, 45%)',
    warning: 'hsl(38, 92%, 50%)',
    error: 'hsl(0, 84%, 60%)',
    info: 'hsl(210, 100%, 55%)',
} as const;

// =============================================================================
// TYPOGRAPHY - SF Pro inspired
// =============================================================================

export const typography = {
    fonts: {
        sans: '"SF Pro Display", "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
        mono: '"SF Mono", "Fira Code", "JetBrains Mono", monospace',
    },

    sizes: {
        xs: '0.75rem',     // 12px
        sm: '0.875rem',    // 14px
        base: '1rem',      // 16px
        lg: '1.125rem',    // 18px
        xl: '1.25rem',     // 20px
        '2xl': '1.5rem',   // 24px
        '3xl': '1.875rem', // 30px
        '4xl': '2.25rem',  // 36px
        '5xl': '3rem',     // 48px
        '6xl': '3.75rem',  // 60px
        '7xl': '4.5rem',   // 72px
    },

    weights: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
    },

    lineHeights: {
        tight: '1.1',
        snug: '1.25',
        normal: '1.5',
        relaxed: '1.625',
    },

    letterSpacing: {
        tight: '-0.02em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
    },
} as const;

// =============================================================================
// SPACING - 8px grid system
// =============================================================================

export const spacing = {
    px: '1px',
    0: '0',
    0.5: '0.125rem',  // 2px
    1: '0.25rem',     // 4px
    1.5: '0.375rem',  // 6px
    2: '0.5rem',      // 8px
    2.5: '0.625rem',  // 10px
    3: '0.75rem',     // 12px
    3.5: '0.875rem',  // 14px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    7: '1.75rem',     // 28px
    8: '2rem',        // 32px
    9: '2.25rem',     // 36px
    10: '2.5rem',     // 40px
    12: '3rem',       // 48px
    14: '3.5rem',     // 56px
    16: '4rem',       // 64px
    20: '5rem',       // 80px
    24: '6rem',       // 96px
    32: '8rem',       // 128px
} as const;

// =============================================================================
// RADIUS - Apple's smooth corners
// =============================================================================

export const radius = {
    none: '0',
    sm: '0.375rem',    // 6px - small elements
    md: '0.5rem',      // 8px - inputs
    lg: '0.75rem',     // 12px - cards
    xl: '1rem',        // 16px - larger cards
    '2xl': '1.25rem',  // 20px - modals
    '3xl': '1.5rem',   // 24px - hero sections
    full: '9999px',    // Pills/chips
} as const;

// =============================================================================
// SHADOWS - Subtle, layered Apple shadows
// =============================================================================

export const shadows = {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    glow: '0 0 20px rgba(59, 130, 246, 0.3)',
    'glow-lg': '0 0 40px rgba(59, 130, 246, 0.4)',
} as const;

// =============================================================================
// ANIMATIONS - Smooth Apple-like motion
// =============================================================================

export const animations = {
    duration: {
        instant: '75ms',
        fast: '150ms',
        normal: '200ms',
        slow: '300ms',
        slower: '500ms',
        slowest: '700ms',
    },

    easing: {
        default: 'cubic-bezier(0.25, 0.1, 0.25, 1)',      // Apple's default
        in: 'cubic-bezier(0.4, 0, 1, 1)',
        out: 'cubic-bezier(0, 0, 0.2, 1)',
        inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Playful bounce
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',      // Spring effect
    },
} as const;

// =============================================================================
// Z-INDEX - Layering system
// =============================================================================

export const zIndex = {
    behind: -1,
    base: 0,
    dropdown: 10,
    sticky: 20,
    fixed: 30,
    modal: 40,
    popover: 50,
    tooltip: 60,
} as const;
