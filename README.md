# Kristina Shynkaruk — Wedding Photography

A multilingual portfolio with separate Portfolio, Wedding stories, About, and Contacts pages, plus an owner workspace for managing wedding series. The frontend is vanilla HTML/CSS/JavaScript; the Azure API uses Azure Functions and Blob Storage SDKs.

## Local preview
Run `npm start` and open http://127.0.0.1:4173. Devices on the same network can also connect.

Open `/admin` on the laptop to create/edit series, upload folders or individual photos, choose covers, reorder photos, preview drafts, publish, unpublish or delete. Local content persists in `.data/`; publishing here updates only the local preview. The public site supports English, Polish and Ukrainian titles. Cloud owner sign-in and storage setup are documented in [azure/README.md](azure/README.md).

Run `npm run check` and `npm test` for validation. Azure deployment is a separate, manual operation. No admin assets are included in the GitHub Pages build because GitHub Pages cannot enforce owner authentication or run this API.

## GitHub Pages
The publication source is the `docs` folder on the `main` branch.

1. Edit source files in `dist`.
2. Run `npm run build:github` to regenerate `docs` with the repository URL prefix.
3. Commit and push both source and generated files. GitHub Pages publishes automatically.

## Source
- `dist/index.html`: Portfolio.
- `dist/wedding-stories/index.html`: Wedding stories.
- `dist/about/index.html`: About.
- `dist/contacts/index.html`: Contacts.
- `dist/style.css`: Shared styling.
- `dist/app.js`: Galleries, sample wedding data, and navigation.
- `dist/language.js`: English, Polish, and Ukrainian translations.
- `dist/images`: Optimized photographs.
- `build-github.mjs`: Generates the GitHub Pages output without changing local preview files.

Wedding names and dates are illustrative samples sharing the supplied photos. Instagram and Telegram links are pending. The provided phone number supports tap-to-call. No booking or payment service is connected. Fonts load from Google Fonts with local fallback fonts.

## Portfolio management
The Ukrainian owner workspace includes a **Портфоліо** tab for the homepage photographs. Upload folders or individual photos, drag to reorder (or use arrow buttons), remove photos, preview and save drafts, then publish. No cover or wedding date is required. The public homepage reads only the published portfolio, keeps three columns and 1px gaps, and follows that same order in its lightbox. Portfolio changes do not change wedding stories. Existing stored content is migrated on first write with the original 15 portfolio photographs. The local preview updates locally; GitHub Pages remains static until cloud deployment.
