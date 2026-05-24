# Mocktail Finder App — UI/UX & Performance Optimizations

This document describes the key optimizations and improvements made for the Mocktail Finder app as part of this assignment.

## 🚀 Technical and Animation Optimizations

### 1. Migrating Web Animations to React Native Native-Driven Animations

- A complex CSS keyframe animation of the martini-glass logo with bubbles was fully recreated using `react-native-svg` and React Native’s native `Animated` API.
- **Seamless Pulse Loop:** The issue with micro-freezes or “jumps” in `Animated.loop` was fixed. Since React Native resets the value after each loop, the initial scale value (`logoScale: 0.98`) was synchronized with the lowest point of the animation sequence. As a result, the logo now has a perfectly smooth and continuous “breathing” effect.
- **Hardware Acceleration:** `useNativeDriver: true` was explicitly enabled for all motion effects, including logo pulsing, bubble movement, and gradient appearance. This reduces the load on the JavaScript thread and helps maintain smooth 60 FPS performance, even during heavier screen transitions.

### 2. Scalable Bubble Physics

- Instead of using fixed CSS coordinates that could break on mobile devices, a dynamic `scaleRatio` calculation was implemented.
- A bubble configuration system was created using values such as `baseTransX`, `startY`, and `baseScale`. This allows each bubble to have a unique size, more natural movement, and the correct starting point directly from the edge of the glass.
- The bubble movement stays correctly within the component boundaries, whether the logo is used in the header (`size=24`) or on the Splash Screen (`size=100`).

### 3. Gradient Shimmer Effect on the Splash Screen

- The gradient shimmer effect was optimized.
- A light-wave effect was created by animating the `translateX` value of a wide `<LinearGradient>` component together with an opacity pulse from `0` to `0.8` using bright neon colours. This creates a strong visual shimmer effect while keeping resource usage low and avoiding complex masks.

---

## 🎨 UI/UX Improvements

### 4. Cleaner and More Minimal Interface

- To free up useful space and reduce visual noise, unnecessary subtitles were removed from the headers on all main screens: Mocktail Finder, Favourites, and Add Recipe.
- The spacing between the glass logo and the main title in the header was reduced from `12px` to `8px`. This helped group and centre these elements more accurately.

### 5. Improved Interactive Elements and Calls to Action

- The unclear circular “Random” button next to Featured Recipes on the `MocktailFinderScreen` was replaced with a clearer pill-shaped button labelled **“Surprise recipe”** with an icon. This makes the action more understandable and predictable for users.
- Extra space was also freed by removing the unnecessary “total” text counter next to the Featured Recipes list.

### 6. Unified Add Recipe Screen

- On the `AddRecipeScreen`, the “white sheet” layout with rounded top corners (`borderTopRadius`) and negative `marginTop` was removed because it overlapped with the header.
- The form now connects seamlessly with the header using straight edges, creating a more consistent layout with the other screens of the app.
## Фото застосунку

<img width="2356" height="4198" alt="UI" src="https://github.com/user-attachments/assets/f3903513-5c27-4f32-a386-e77c7ff99cde" />
