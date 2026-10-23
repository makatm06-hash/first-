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
- Looping Ninja, Shark, Sodii, and Adobe brand strip, scroll reveals, reduced-motion support.
- “Edit media” accepts images and videos up to 100 MB, saved in IndexedDB in the current browser. This is a local demonstration, not a secure CMS. Uploads are not shared with other visitors.
- Project enquiries are submitted to Formspree and emailed to the recipient configured in its dashboard. The form includes required-field validation, spam honeypot, pending/success/error states, duplicate-submit protection, and a 20-second timeout. Failed submissions keep the visitor’s details for retry.

## Before publishing

Replace sample projects, bundled concept artwork, and studio copy. Connect authenticated media management and hosting for permanent uploads. Verify the Formspree recipient and notification settings, send a live test enquiry to confirm delivery, and publish the relevant privacy information. No credentials should be included in client-side code.

## Browser checks

```sh
npx playwright test
# Set CHROMIUM_PATH if Chromium is not installed at /usr/bin/chromium.
```

## Client logo assets

The client strip contains Ninja (kitchen appliances), Shark (home appliances), Sodii (Australian hydration), and Adobe. The three PNG logos were supplied by the user in `logos.zip` and are bundled unchanged under `public/logos/`. All logos are centered in matching responsive frames using `object-fit: contain` to preserve their original proportions. Adobe retains its existing symbol and text treatment.

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

The original `videos.zip` exceeded the workspace transfer tool’s 32 MiB limit. The user subsequently supplied YouTube URLs, now configured as privacy-enhanced embeds in the matching project viewers:

- Saucony: https://youtu.be/JLWG4RrAMek
- RIMOWA, “a lifetime of lives”: https://youtu.be/yZzb0bxzl5I
- Stone Island: https://youtu.be/CIXPhkQkelI

The existing cover images remain in the portfolio and showcase. YouTube players load only when a project opens, do not autoplay, support fullscreen and inline playback, and are removed on closing the viewer to stop playback. Each project also links to the original YouTube page. Product photography remains a static collage. Automated mapping tests mock the external frame response and do not establish remote video availability or playback permission.

## Motion

`src/motion.js` adds one-time scroll reveals and short staggered entrances across the hero, work, agency, booking, and footer sections. CSS adds restrained cover zoom, button feedback, a gentle studio symbol drift, showcase fades, and project viewer entrances. OS reduced-motion preferences disable movement immediately, including when changed during a visit. Keyboard-focused content is immediately visible; content also remains visible when IntersectionObserver is unavailable. No animation library or scroll event loop is required.


## Cover carousel

`src/cover-carousel.js` arranges the featured covers around a larger central image with a slow continuous loop, arrow controls, horizontal trackpad scrolling, and mouse/touch dragging. When the carousel is keyboard-focused, Space pauses or resumes the loop. Vertical wheel and touch gestures keep their native page scrolling; the carousel has no pinned scroll sequence. It stops animating offscreen and respects reduced-motion preferences.


## Email enquiries

The form posts to the public endpoint `https://formspree.io/f/mvkkojpb` with an `email` field for replies and the name, service, ideal date, budget, and project brief. Manage the receiving email, email notifications, and spam settings in Formspree; no email password or secret key is bundled in the site. Browser checks mock Formspree responses and do not send real emails or confirm inbox delivery.
