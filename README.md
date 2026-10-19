# MASTUDIO

A responsive creative portfolio built with Vite, vanilla JavaScript, and locally bundled Inter.

## Development

Requires Node.js 20.19+ or 22.12+.

```sh
npm ci --cache /workspace/.npm-cache
npm run dev
```

Create a production build with `npm run build`; serve it with `npm run preview`.

## Current capabilities

- Responsive portfolio, category filters, accessible modal project views.
- Looping Ninja, Shark, Sodii, Budweiser, and Adobe brand strip, scroll reveals, reduced-motion support.
- “Edit media” accepts images and videos up to 100 MB, saved in IndexedDB in the current browser. This is a local demonstration, not a secure CMS. Uploads are not shared with other visitors.
- Booking form validates required fields and downloads a plain-text request. It does **not** send email or submit a booking.

## Before publishing

Replace sample projects, bundled concept artwork, temporary client wordmarks, and studio copy. Connect authenticated media management and hosting for permanent uploads. Connect a booking API/email provider, add server-side validation and abuse protection, and publish the relevant privacy information. No credentials should be included in client-side code.

## Browser checks

```sh
npx playwright test
# Set CHROMIUM_PATH if Chromium is not installed at /usr/bin/chromium.
```

## Client logo assets

The client strip contains Ninja (kitchen appliances), Shark (home appliances), Sodii (Australian hydration), Budweiser, and Adobe. Ninja, Shark, Sodii, and Budweiser currently use plain text placeholders, not their official logos. Their official sites were blocked by the setup environment's network policy. Supply official SVG or transparent PNG files under `public/logos/`, then set each brand's `logo` path in `src/main.js` and hide its text span if the artwork includes the wordmark.

Adobe's monochrome symbol is sourced from Simple Icons 11.15.0: https://raw.githubusercontent.com/simple-icons/simple-icons/11.15.0/icons/adobe.svg. Simple Icons: https://github.com/simple-icons/simple-icons/tree/11.15.0 (CC0 collection; brand marks remain their owners' trademarks).
