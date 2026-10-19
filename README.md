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
- Looping sample client wordmarks, scroll reveals, reduced-motion support.
- “Edit media” accepts images and videos up to 100 MB, saved in IndexedDB in the current browser. This is a local demonstration, not a secure CMS. Uploads are not shared with other visitors.
- Booking form validates required fields and downloads a plain-text request. It does **not** send email or submit a booking.

## Before publishing

Replace sample projects, bundled concept artwork, sample client wordmarks, and studio copy. Connect authenticated media management and hosting for permanent uploads. Connect a booking API/email provider, add server-side validation and abuse protection, and publish the relevant privacy information. No credentials should be included in client-side code.

## Browser checks

```sh
npx playwright test
# Set CHROMIUM_PATH if Chromium is not installed at /usr/bin/chromium.
```
