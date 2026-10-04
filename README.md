# Kristina Shynkaruk — Wedding Photography

A multilingual portfolio with separate Portfolio, Wedding stories, About, and Contacts pages. Built with HTML, CSS, and vanilla JavaScript, without dependencies.

## Local preview
Run `npm start` and open http://127.0.0.1:4173. Devices on the same network can also connect.

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
