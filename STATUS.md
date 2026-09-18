# STATUS — log of work done (newest first)

Append one entry per finished task: date · task · what changed · files · how verified.

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
