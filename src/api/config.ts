/**
 * TheCocktailDB access configuration.
 *
 * The public test key "1" is allowed for development only. A published app
 * must use a Premium key (one-off fee, https://www.thecocktaildb.com/api.php),
 * which is served from the v2 endpoints.
 *
 * Provide the key via the EXPO_PUBLIC_COCKTAILDB_API_KEY environment variable:
 *   - locally: put it in `.env.local` (git-ignored)
 *   - EAS Build: add it as an environment variable in the Expo project settings
 * The value is inlined into the JS bundle at build time, so treat it as public.
 */
const TEST_KEY = '1';

export const COCKTAILDB_API_KEY: string =
  (process.env.EXPO_PUBLIC_COCKTAILDB_API_KEY || '').trim() || TEST_KEY;

export const IS_TEST_KEY = COCKTAILDB_API_KEY === TEST_KEY;

const API_VERSION = IS_TEST_KEY ? 'v1' : 'v2';

export const COCKTAILDB_BASE_URL = `https://www.thecocktaildb.com/api/json/${API_VERSION}/${COCKTAILDB_API_KEY}`;

if (__DEV__ && IS_TEST_KEY) {
  console.warn(
    '[Mocktail Finder] Using TheCocktailDB test key. Set EXPO_PUBLIC_COCKTAILDB_API_KEY before building for the App Store.'
  );
}
