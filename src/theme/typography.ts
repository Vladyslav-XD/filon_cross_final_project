/**
 * Font families available in the app.
 * Sora (OFL-licensed) is loaded in App.tsx via expo-font before the splash finishes,
 * so these names are safe to use anywhere after the splash.
 */
export const fonts = {
  /** Brand wordmark ("Mocktail Finder" in the header). */
  brand: 'Sora_700Bold',
  brandMedium: 'Sora_600SemiBold',
} as const;
