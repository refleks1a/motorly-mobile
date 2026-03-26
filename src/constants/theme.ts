// Design tokens for Motorly
// Source: DESIGN.md — "The Precision Editorial" design system
// Rule: Always use these tokens. Never hardcode colors, font sizes, or spacing.

export const Colors = {
  // Primary brand
  primary: '#a83900',         // Safety Orange — high-intent actions (buttons, active states)
  primaryContainer: '#ff6b2c', // Hero moments, urgent diagnosis states

  // Backgrounds & surfaces (tonal layering — no borders)
  background: '#f9f9f7',       // Warm white — main page background
  surface: '#ffffff',           // Cards, primary interactive areas
  surfaceContainerLow: '#f4f4f2', // Secondary content sections
  surfaceContainerLowest: '#ffffff', // Actionable cards (pure white on warm bg)
  surfaceContainerHigh: '#eeeeec',  // Input backgrounds

  // Text
  onBackground: '#1a1a1a',     // Primary text
  onSurface: '#1a1a1a',        // Text on cards
  onSurfaceVariant: '#6b6b6b', // Secondary text, metadata labels
  onPrimary: '#ffffff',        // Text on orange buttons

  // Semantic
  error: '#b91c1c',            // Errors
  errorContainer: '#fee2e2',   // Error chip backgrounds
  success: '#15803d',          // "Good" / "Open" states
  warning: '#b45309',          // "Due Soon" states

  // Chips
  tertiaryContainer: '#e0f2fe', // Info chips (blue-tinted)

  // Outline (Ghost Border — used sparingly at 15% opacity)
  outlineVariant: '#c4c4c4',
} as const;

export const Typography = {
  // Font families
  fontDisplay: 'Manrope',      // Headlines, display text
  fontBody: 'Inter',           // Body, labels, metadata

  // Font sizes (sp — scale-independent pixels)
  displayLg: 48,   // Empty states, major health scores
  displayMd: 36,
  headlineLg: 30,  // Section headers
  headlineMd: 24,
  titleLg: 20,
  titleMd: 18,
  titleSm: 16,     // Button text
  bodyLg: 16,      // Standard — minimum for technical readouts (accessibility)
  bodyMd: 14,
  labelMd: 13,     // Metadata (e.g. "Last Service: 2,000 miles ago")
  labelSm: 11,     // Nav bar labels

  // Font weights
  weightRegular: '400' as const,
  weightMedium: '500' as const,
  weightSemiBold: '600' as const,
  weightBold: '700' as const,
  weightExtraBold: '800' as const,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,   // Standard card radius
  lg: 16,
  full: 999, // Pill-shaped chips
} as const;

export const Elevation = {
  // Tab bar / floating elements only — ambient shadow
  floating: {
    shadowColor: '#1a1a1a',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 4, // Android
  },
} as const;

export const Button = {
  height: 56,              // Primary button height (dp)
  radiusPrimary: 12,
  touchMinSize: 48,        // Minimum touch target
} as const;
