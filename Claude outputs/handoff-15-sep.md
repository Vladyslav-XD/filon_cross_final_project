# Що зроблено, поки тебе не було (15 вересня, вечір)

## Код (усе записано в папку проєкту на Mac, tsc чистий, Metro-бандл збирається)

**1. Підзаголовки карток = характер напою.** `src/utils/drinkTags.ts` виводить теги з інгредієнтів, мір, інструкції та категорії TheCocktailDB. Словник: температура Hot / Iced / Frozen; характер Chocolate, Coffee, Tea, Citrus, Tropical, Berry, Minty, Spiced, Savoury (додав — для томатного «Tomato Tang» і солоних лассі), Creamy, Sparkling, Fruity, Sweet. На картці — до трьох, температура перша, далі тег, чиє слово є в назві напою («Drinking Chocolate» → Chocolate першим). Перевірив таблицю для всіх 58 напоїв руками: `mocktail-finder-release/data/tagcheck.mjs`.

**2. Деталі напоїв кешуються.** `src/api/detailsCache.ts` — після першого завантаження списку застосунок довантажує деталі всіх 58 напоїв (по 4 паралельно, ~3 с) і зберігає в AsyncStorage на 30 днів. Картки заповнюються поступово; екран рецепта відкривається миттєво; повторні запуски — без мережі для деталей.

**3. Фільтри на головній стали справжніми.** Раніше «Refreshing/Fruity/…» призначались напоям псевдовипадково за сумою символів назви. Тепер чипи «Category» = ті самі теги (без Sweet — він у 34 з 58 напоїв), «Filter by Ingredients» = Orange, Lemon, Lime, Apple, Pineapple, Banana, Berries, Ginger, Mint, Milk, Yoghurt (підібрані по базі, у кожного є збіги). Пошук шукає і в назві, і в інгредієнтах.

**4. Add Recipe.** Кнопка «Add Photo» → системний пікер iOS (без запиту дозволу на всю галерею — застосунок отримує лише вибране фото). Фото копіюється у папку застосунку зі стисненням; у рецепті зберігається лише ім'я файлу (`recipe-photo:<id>.jpg`), бо абсолютний шлях на iOS змінюється після оновлення застосунку. Замість однієї «Category» — «Character (up to 3)» із того ж словника, чипи у два ряди без скролу. Поле Image URL прибрано. У Share локальне фото не додається.

**5. Дрібне.** На екрані рецепта замість фейкового бейджа «Herbal» — теги; на Random — теги замість «Random Pick»; старі улюблені з «Non-alcoholic mocktail» мігрують автоматично; README оновлено.

**6. Незалежне рев'ю коду** (окремий агент) знайшло 1 баг (екран рецепта не скидав стан при відкритті іншого рецепта з Favourites) і кілька ризиків — усе виправлено.

## App Store Connect
- Promotional Text і Description без «100+» (з «with friends», фото, новими фільтрами) — збережено.
- Документ `claude/app-store-listing-and-pages.md` оновлено: тексти, нові заголовки скріншотів, Privacy Policy (речення про фото і кеш), Support (FAQ про фото і теги).

## Твої кроки, коли повернешся (у Terminal, у папці проєкту)

```bash
cd ~/Downloads/filon_cross_final_project-master
npm install                # підтягне expo-image-picker і expo-file-system
npx expo start -c          # -c скидає кеш Metro після нових модулів; далі натисни i
```
Expo Go вже містить обидва нативні модулі, тож симулятор запуститься без перезбирання. Я проганяю симулятор сам (картки, фільтри, Add Recipe з фото, темна тема).

Після тесту:
```bash
git add -A && git commit -m "Character tags, real filters, recipe photos"
npx eas-cli@latest build --platform ios --profile production
npx eas-cli@latest submit --platform ios --latest
```
Потім я прикріплю новий білд до версії 1.0 в ASC (замість №3). Далі — TestFlight на телефоні, дві сторінки на сайті, Add for Review.

## Що змінити в скріншотах (твій макет у Claude Design)
- №1 headline: `Real alcohol-free recipes, with photos`; sub: `Smoothies, lemonades, punches and hot chocolates — ready the moment you open the app.`
- №3 headline: `Filter by character or ingredient`; sub: `Iced, hot, citrus, creamy — or whatever is in the fridge.`
- №6 headline: `Add your own, with a photo`.
Сирі скріни для 1, 3 і 6 перезніму з нового білда в симуляторі.
