# STATUS — log of work done (newest first)

Append one entry per finished task: date · task · what changed · files · how verified.

## 2026-09-18 · task 4 — remember the theme (Claude Code)
- `ThemeContext` now holds three modes: `system | light | dark`. `theme` (what is drawn) stays what every screen reads, so no screen changed — only `Header` knows about modes. Saved under `STORAGE_KEYS.theme` (`@mocktail-finder/theme`).
- `loadThemeMode()` is awaited in `App.tsx` inside the same `Promise.all` as the store and the details cache, and passed to `ThemeProvider` as `initialMode` — the app opens in the saved theme with no flash.
- **Way back to "system":** press and hold the header toggle. A tap switches light ↔ dark explicitly (that is what a tap always did); a long press hands control back to iOS. While the app is following the system, a small white dot sits on the toggle — without it "system" and "light" would look identical. A third tap state was the alternative, but it makes the everyday light ↔ dark tap a three-way cycle, which is worse for the common case.
- Files: `src/context/ThemeContext.tsx`, `src/components/Header.tsx`, `src/storage/storage.ts`, `App.tsx`.
- Verified: `npx tsc --noEmit` clean, `npx expo export --platform ios` builds, app runs in the simulator and the system dot shows on the toggle. Persistence across a restart still wants one human check.

## 2026-09-18 · task 3 — camera for recipe photos (Claude Code)
- `app.json`: `cameraPermission` text set on the `expo-image-picker` plugin ("Mocktail Finder uses the camera only to take a picture for a recipe you create. Photos stay on your device."); `photosPermission` unchanged, `microphonePermission` still false. This string is what iOS shows in the permission dialog, so it ships with the next build — a JS reload will not pick it up.
- `takeRecipePhoto()` in `src/utils/recipePhotos.ts`: `requestCameraPermissionsAsync()` then `launchCameraAsync({ quality: 0.7, exif: false })`. On refusal it explains and offers "Open Settings" (`Linking.openSettings()`) — after the first refusal iOS never asks again, so Settings is the only way back.
- Add Photo / Change photo now open an `ActionSheetIOS` sheet: Take Photo / Choose from Library / Cancel. Android keeps the library path (no sheet).
- Files: `app.json`, `src/utils/recipePhotos.ts`, `src/screens/AddRecipeScreen.tsx`.
- Verified: `npx tsc --noEmit` clean, `npx expo export --platform ios` builds.
- **Needs a real iPhone via TestFlight:** the simulator has no camera, so "Take Photo", the permission dialog and its wording can only be checked there. The Privacy Policy page on vladfilon.com still needs one sentence about the camera (Cowork's side); App Privacy stays "Data Not Collected".

## 2026-09-18 · task 2 — edit own recipe (Claude Code)
- "Edit" sits next to "Delete" in one row on the details screen (both outlined, Delete in `colors.error`). Added `PencilIcon`.
- **Where Edit lives.** `AddRecipeScreen` is registered a second time, in `StackNavigator` as `EditRecipe`, and pushed on top of the recipe with a `recipe` param. Going through the Add Recipe *tab* instead would have left the param stuck on that tab — tap "Add Recipe" later and you would still be editing the old recipe. A pushed screen is a fresh instance every time, so the form simply initialises from the param and Back returns to the recipe.
- `Header` gained an optional `onBack` (back arrow replacing the martini mark); only the Edit screen passes it. Save button reads "Save Changes", title "Edit Recipe".
- `updateRecipe` added to `myRecipesSlice` (replaces in place, keeps id and list position). `RecipeDetailsScreen` now reads the recipe from the store when it is a user recipe and falls back to the route param — that is what makes an edit visible immediately.
- Favourites: `FavoritesContext.updateFavorite` refreshes a favourited copy after an edit; without it Favourites kept the old name and photo. Not in the task, but the stale copy was visible in the UI.
- Photo on edit: the form starts with the recipe's own photo (the stock fallback is not treated as one). Keep it → nothing happens; replace it → `persistRecipePhoto` writes over the same `<id>.jpg` (it now deletes the destination first, because a copy onto an existing file fails on iOS); remove it → file deleted, recipe falls back to the stock image.
- Ingredients round-trip: a saved line ("50 ml lime juice") goes back into the *name* field with the amount left empty — splitting it into amount + name again would only guess wrong and mangle what the user typed.
- Files: `src/screens/AddRecipeScreen.tsx`, `src/screens/RecipeDetailsScreen.tsx`, `src/navigation/StackNavigator.tsx`, `src/constants/screens.ts`, `src/store/myRecipesSlice.ts`, `src/context/FavoritesContext.tsx`, `src/components/Header.tsx`, `src/components/icons/index.tsx`, `src/utils/recipePhotos.ts`.
- Verified: `npx tsc --noEmit` clean, `npx expo export --platform ios` builds, app reloads in the simulator with no error screen. The tap-through (edit → save → values persist after restart) still needs a human, same reason as task 1.

## 2026-09-18 · task 1 — delete own recipe (Claude Code)
- `RecipeDetailsScreen`: "Delete Recipe" below "Share Recipe", shown only when the id is in the `myRecipes` store (`useSelector`), so TheCocktailDB drinks never get it. Outlined in `colors.error`, not filled — destructive but not the loudest button on the screen. Confirmation via `Alert.alert` ("Delete this recipe?" / Cancel / Delete, destructive style). On confirm, in this order: `deleteRecipePhoto(recipe.imageUrl)` → remove from favourites if saved → `dispatch(removeRecipe(id))` → `navigation.goBack()`. Photo first: once the recipe leaves the store nothing points at the file any more.
- Added `TrashIcon` to `src/components/icons/index.tsx` (the set had none). Light `colors.error` changed `#ff0000` → `#DC2626`: the token was unused anywhere, and pure red on white is harsh.
- `styles.shareBtn` bottom margin `xxl` → `m` so Share and Delete sit as one pair; the scroll view already pads 100 at the bottom.
- Files: `src/screens/RecipeDetailsScreen.tsx`, `src/components/icons/index.tsx`, `src/theme/colors.ts`.
- Verified: `npx tsc --noEmit` clean, `npx expo export --platform ios` builds the bundle, app launches in the iPhone 17 simulator with the new code (home list and navigation fine).
- **Not yet verified by hand:** the tap-through (create a recipe with a photo → delete → photo file gone, list updates). This session cannot tap in the simulator — macOS assistive access is not granted to the terminal — so Vlad or Cowork should run that once.

## 2026-09-18 · task 0 — tag the reviewed state (Claude Code)
- Annotated tag `v1.0.0-build4` created on `2f32cfb` ("Character tags, real filters, recipe photos") — the commit Apple is reviewing as 1.0.0 build 4. Tag is local only; not pushed (needs Vlad's ok, and the GitHub remote still has old history).
- Branch `release/1.1` created from `2f32cfb` and checked out; `master` is left untouched at the reviewed state. All 1.1 work goes on `release/1.1`.
- Files: `TASKS.md`, `STATUS.md` (this entry), plus `CLAUDE.md` committed for the first time — all three were untracked until now.
- Still untracked on purpose: `assets/drinks/` and `src/data/drinkPhotos.ts` (they go in with task 6, as the queue asks), and the `Claude outputs/` folder (working screenshots/notes — Vlad decides whether it belongs in the repo).
- Verified: `git tag -l` shows the tag, `git show v1.0.0-build4` points at `2f32cfb`, `git branch --show-current` = `release/1.1`.

## 2026-09-17 · drink photos ready (Cowork)
- Vlad generated 58 photos (2048×2048 JPEG, consistent studio style) in `~/Desktop/Mocktail Finder 1.1/photos/`. Cowork resized them to 900×900 JPEG q82 → `assets/drinks/<id>.jpg` (58 files, 2.9 MB total) and generated `src/data/drinkPhotos.ts` (`drinkPhoto(id)`). Verified: every one of the 58 TheCocktailDB ids has a file, no extras, `npx tsc --noEmit` clean. Task 6 in TASKS.md is unblocked — wiring the map into the screens is Claude Code's part.

## 2026-09-17 · setup (Cowork)
- 1.0 (1.0.0 build 4) is in App Review; reply to Apple's "Information Needed" sent 16 Sept, waiting. No 1.1 code written yet.
- Added `CLAUDE.md`, `TASKS.md`, `STATUS.md`. Claude Code takes the queue in `TASKS.md`; Cowork handles App Store Connect, texts, screenshots and drink photos.
