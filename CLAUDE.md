# Mocktail Finder — guide for Claude Code

Read this first. It describes the project, how it is built and released, what is in flight right now, and how Vlad likes to work.

## Working with Vlad

- Vlad is a UX/UI designer, not a developer. Answer in Ukrainian. Explain every action and the reasoning behind each choice before doing it — teach, don't just run commands.
- Show what you are about to run or change and wait for his «ок» before anything irreversible: `eas submit`, `git push`, deleting files, anything in App Store Connect.
- Never print or commit secrets. `.env.local` holds the TheCocktailDB key and is git-ignored; leave it alone.
- Release state and decisions live in the claude.ai Project "Mocktail Finder" (docs `app-store-release-audit.md`, `app-store-listing-and-pages.md`, `photo-brief-1.1.md`). The Cowork session handles App Store Connect, texts, screenshots and photos; Claude Code handles builds, the simulator and git. Keep the "Current status" section below in sync when you change something.

## Task queue and status (how Cowork and Claude Code talk)

- `TASKS.md` — the queue. Cowork (or Vlad) adds tasks; work them top-down, one task = one commit, tick the box when done.
- `STATUS.md` — the log. After every finished task append: date, what changed, files touched, how it was verified. Cowork reads this file to pick up where you left off, so keep it factual and short.
- Before each commit: `npx tsc --noEmit` must be clean. Never run `eas build`, `eas submit` or `git push` without Vlad's explicit ok in the terminal.

## What the app is

iOS app (Expo SDK 54, React Native 0.81, React 19.1, TypeScript, Redux Toolkit, React Navigation) that helps people discover, save and create alcohol-free drink recipes. Recipes come from TheCocktailDB (58 drinks in the `Non_Alcoholic` filter); favourites, user recipes and their photos are stored on the device only. No accounts, no analytics, no servers of our own. Bundle ID `com.filonexperiencedesign.mocktailfinder`, App Store ID 6811610325, iPhone only (`supportsTablet: false`), age rating 4+.

## Code map

- `App.tsx` — providers, splash (`SplashScreen.tsx`, waits for the Sora font), `Promise.all([hydrateStore(), loadDetailsCache()])`.
- `src/api/api.ts` — `fetchMocktailList()` (list endpoint returns only id/name/thumb) and `fetchMocktailDetails(id)`; `src/api/config.ts` — key/base URL; `src/api/detailsCache.ts` — memory + AsyncStorage cache of details (30-day TTL, prefetch with concurrency 4); `src/api/recipes.ts` — `withDetails`, `fetchMocktails`, `fillInDetails`.
- `src/utils/drinkTags.ts` — character tags (Iced/Frozen/Hot, Citrus, Tropical, Berry, Fruity, Creamy, Sparkling, Chocolate, Coffee, Tea, Minty, Spiced, Sweet, Savoury) derived from ingredients, measures, instructions and category. Cards show up to 3 (`tagsToSubtitle`). The same tags are the "Category" filters (`src/constants/filters.ts`, without Sweet); ingredient filters are regex-based there too.
- `src/utils/recipePhotos.ts` — user photos: PHPicker via `expo-image-picker` (no library permission prompt), copied to `documentDirectory/recipe-photos/<id>.jpg`, stored as `recipe-photo:<id>.jpg` (relative on purpose — the container path changes between app updates), resolved with `resolveImageUri`.
- `src/utils/recipeText.ts` — share text; `APP_STORE_URL` is empty until the app is live.
- `src/screens/*` — MocktailFinder (home: search, filters, list), RecipeDetails, Random ("Surprise"), Favourites, AddRecipe. `src/context/FavoritesContext.tsx` (favourites in AsyncStorage), `src/store/myRecipesSlice.ts` + `store.ts` (user recipes, `migrateRecipe` for old shapes; `removeRecipe` exists but has no UI yet), `src/context/ThemeContext.tsx` (follows the system theme, choice is not persisted yet).
- Hermes: no regex lookbehind. UK spelling in UI ("Favourites").

## Commands

```bash
npm install
npx tsc --noEmit                      # type check — keep it clean
npx expo export --platform ios        # bundle smoke test (no device needed)
npx expo start -c                     # dev server; press i for the iOS simulator (iPhone 17, status bar overridden to 9:41)
npx eas-cli@latest build --platform ios --profile production   # cloud build; build number auto-increments (appVersionSource: remote)
npx eas-cli@latest submit --platform ios                       # upload to App Store Connect / TestFlight
```

- If `eas build` asks "Do you want to log in to your Apple account?" answer **n** — signing credentials and the ASC API key live on Expo's servers.
- `EXPO_PUBLIC_COCKTAILDB_API_KEY` is set in `.env.local` locally and as an Expo project environment variable for EAS; without it the app silently uses TheCocktailDB's test key (dev only).
- In zsh `#` is not a comment in an interactive shell — never paste commands with trailing `# comments`.
- To reset the app's data in the simulator: delete Expo Go (`xcrun simctl uninstall booted host.exp.Exponent`), then press `i` again.
- Simulator can't test the camera; anything camera-related must be checked on a real iPhone through TestFlight.

## Current status (update me)

- **1.0 (version 1.0.0, build 4)** is submitted to App Review. On 16 Sept Apple asked for information (Guideline 2.1, new developer account); the reply with a screen recording was sent the same day and the Notes field was updated. Waiting for Apple. Do not create a new build for 1.0 unless Apple asks for a code change. Release is manual (Release This Version after approval).
- Git: the working folder has its own history (`Prepare 1.0 for App Store release`, `Character tags, real filters, recipe photos`). Before starting 1.1 work, tag the current state: `git tag v1.0.0-build4`. GitHub remote (`Vladyslav-XD/filon_cross_final_project`) still has old history — pushing needs a decision from Vlad.
- Known leftovers for later: remove `ios.buildNumber` from `app.json` (EAS manages it remotely); set `APP_STORE_URL` in `src/utils/recipeText.ts` once the app is live.

## Version 1.1 plan (agreed 17 Sept)

Do not submit 1.1 until 1.0 is approved (one version in review at a time). Version `1.1.0`.

1. **Own recipe: delete (+ edit).** Delete button on the details screen of a user recipe with a confirmation; also delete its photo file (`deleteRecipePhoto`) and remove it from favourites. Edit = open AddRecipe pre-filled.
2. **Camera for recipe photos.** `ImagePicker.launchCameraAsync` + `requestCameraPermissionsAsync`; add `cameraPermission` text to the `expo-image-picker` plugin config in `app.json` ("Mocktail Finder uses the camera only to take a picture for a recipe you create. Photos stay on your device."); "Take Photo / Choose from Library" choice on the Add Photo button. Privacy Policy page on vladfilon.com then needs one sentence about the camera; App Privacy stays "Data Not Collected".
3. **Bundled drink photos.** Vlad generates 58 square images named `<idDrink>.jpg` into `~/Desktop/Mocktail Finder 1.1/photos/`. Resize to 900×900 JPEG (~100 KB each), put them in `assets/drinks/`, add a map id → `require(...)` and use it in RecipeCard/Details/Random with a fallback to the TheCocktailDB image when a file is missing.
4. Small: persist the theme choice (System/Light/Dark) in AsyncStorage; "Add to Favorites" → "Add to Favourites"; details screen sticky header overlaps content; light-photo status bar contrast.
5. Afterwards: new App Store screenshots 1 (new photos) and 6 ("take or pick a photo"), What's New text, TestFlight on a real iPhone (camera!), then submit.
