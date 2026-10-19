# MASTUDIO

The MASTUDIO AI creative production agency website, built with Vite, vanilla JavaScript, and locally bundled Inter. The agency creates video campaigns, commercials, and still-image campaigns for leading DTC and B2B brands through full AI production at scale.

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

Replace sample projects, bundled concept artwork, and studio copy. Connect authenticated media management and hosting for permanent uploads. Connect a booking API/email provider, add server-side validation and abuse protection, and publish the relevant privacy information. No credentials should be included in client-side code.

## Browser checks

```sh
npx playwright test
# Set CHROMIUM_PATH if Chromium is not installed at /usr/bin/chromium.
```

## Client logo assets

The client strip contains Ninja (kitchen appliances), Shark (home appliances), Sodii (Australian hydration), Budweiser, and Adobe. The four PNG logos were supplied by the user in `logos.zip` and are bundled unchanged under `public/logos/`. All logos are centered in matching responsive frames using `object-fit: contain` to preserve their original proportions. Adobe retains its existing symbol and text treatment.

Adobe's monochrome symbol is sourced from Simple Icons 11.15.0: https://raw.githubusercontent.com/simple-icons/simple-icons/11.15.0/icons/adobe.svg. Simple Icons: https://github.com/simple-icons/simple-icons/tree/11.15.0 (CC0 collection; brand marks remain their owners' trademarks).

## Saucony campaign

`public/campaigns/saucony-cover.png` is the original image supplied in `sauc.zip`, kept unchanged. It appears in the main showcase and the first portfolio project, titled Saucony under Photography. Both covers preserve its 16:9 composition and original colours. The remaining project cards still use sample artwork.

## RIMOWA campaign

`public/campaigns/rimowa-a-lifetime-of-lives.png` is the unchanged original cover supplied in `rimowa.zip`. Its title is “a lifetime of lives”. It replaces the second concept project and appears alongside Saucony in the main showcase. Previous/next buttons cycle the two featured campaigns without autoplay; both covers retain their full widescreen composition and original colours.

## Stone Island campaign

`public/campaigns/stone-island-cover.png` is the unchanged original image supplied in `stoney.zip`. It replaces the third concept project and joins Saucony and RIMOWA as the third main showcase slide. Showcase counts are derived from the featured projects. The carousel retains manual controls and no title overlays.

## Product photography

The fourth project and featured cover use `public/campaigns/product-photography/collage.png`, the original collage supplied in `pdm 2.zip`, kept unchanged. It is a single static image with no hover slideshow or photo controls. All four portfolio covers share 16:9 frames, aligned rows, and even spacing, with a single-column layout on mobile. The collage can be opened uncropped in the project viewer.

## Campaign films

A project can specify a `video` URL in `src/main.js`. Keep its `image` as the cover: campaign films appear only when the project viewer opens, with native controls, inline mobile playback, the existing cover as a poster, and metadata-only preloading. Playback does not start automatically and pauses when the viewer closes. URLs can reference locally bundled browser-compatible MP4/WebM assets or externally hosted files.

The uploaded `videos.zip` could not be downloaded because it exceeds the workspace transfer tool’s 32 MiB limit. No campaign video files or video URLs have been added yet. Supply separate files under that limit or direct download URLs before configuring and validating the real films.
