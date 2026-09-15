# Mocktail Finder

**A React Native app designed and built to help people discover, save and create alcohol-free drink recipes.**

[View the full UX case study](https://www.vladfilon.com/mocktail-finder.html)

## My role

UX/UI Designer, UX Writer & React Native Developer. I worked across the experience from user flows and interface design to component behaviour, motion and implementation.

## Product experience

- Discover featured recipes and get a surprise recommendation.
- Search and filter the collection.
- Review recipe details in a mobile-first flow.
- Save favourites for quick return.
- Add a personal recipe with live validation.
- Use the app in light or dark mode.

## Selected UX decisions

- Replaced an ambiguous circular random action with a labelled **Surprise recipe** button.
- Reduced header noise and tightened visual grouping to protect useful mobile space.
- Unified the Add Recipe screen with the rest of the navigation structure.
- Designed responsive motion that scales from the compact header mark to the splash screen.
- Used clear labels and live validation to make recipe creation more predictable.

## Design engineering highlights

- Recreated the animated martini-glass identity with `react-native-svg` and the native `Animated` API.
- Used native-driven transforms for smoother motion and lower JavaScript-thread load.
- Added scale-aware bubble movement so the animation works at multiple component sizes.
- Built the navigation and application state with React Navigation and Redux Toolkit.

## Interface

<img width="1178" alt="Mocktail Finder interface screens" src="https://github.com/user-attachments/assets/f3903513-5c27-4f32-a386-e77c7ff99cde" />

## Stack

React Native · Expo · TypeScript · Redux Toolkit · React Navigation · React Native SVG

## Run locally

```bash
npm install
cp .env.example .env.local   # add your TheCocktailDB key (optional in development)
npm start
```

Expo can then open the project on iOS, Android or the web.

Recipes come from [TheCocktailDB](https://www.thecocktaildb.com/api.php). The public test key works for development; a published build needs a Premium key, passed as `EXPO_PUBLIC_COCKTAILDB_API_KEY` (in `.env.local` locally, or as an environment variable in the Expo project for EAS builds).

## Build and release (iOS)

```bash
npm install -g eas-cli
eas login
eas build --platform ios --profile production   # cloud build, creates signing credentials on first run
eas submit --platform ios                       # uploads the build to TestFlight / App Store Connect
```

Build profiles live in `eas.json`; the production profile auto-increments the build number.

