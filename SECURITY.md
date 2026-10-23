# Security review — 23 October 2026

The site is a static Vite build served by Vercel. It has no mailbox login, SMTP password, server-side upload endpoint, public admin API, or database credentials. The Formspree endpoint is intentionally public; it allows enquiry submissions, not access to the receiving mailbox.

## Checked

- `npm audit` reported zero known dependency vulnerabilities at review time.
- Credential-pattern checks of tracked text and 117 unique historical text objects found no private keys, service tokens, or credential assignments. Pattern scanning cannot prove that every possible secret is absent.
- The campaign PNG containing XMP metadata had no email address, GPS coordinates, or author/location fields detected.
- User enquiry values are submitted as form fields. They are not interpolated into HTML or stored in browser storage by the form.
- External YouTube links use `noopener noreferrer`; videos are embedded through YouTube's privacy-enhanced domain.

## Protections added

- Vercel response headers restrict scripts to the site, submissions/connections to the configured Formspree endpoint, and video frames to YouTube's privacy-enhanced domain. Inline styles remain permitted for the site's animations; inline scripts are blocked.
- The site cannot be framed by other sites; object embeds and base-URL overrides are blocked. MIME sniffing is disabled, HTTPS is reinforced with HSTS, and referrers are restricted to the origin for cross-origin requests.
- Camera, microphone, location, payment, and USB permissions are disabled. Unneeded clipboard and motion permissions were removed from campaign embeds.
- Form submissions omit cookies and refuse HTTP redirects. Existing timeout, retry, duplicate-submit protection, and Formspree honeypot remain active.
- `.env` files and private-key files are ignored by Git going forward.

## Owner account checks

These settings are outside the repository and were not verified or changed:

1. Enable two-factor authentication or passkeys for the receiving email account, GitHub, Vercel, Cloudflare, and Formspree. Use unique passwords and keep recovery codes private.
2. Confirm Formspree's recipient and spam-protection settings. A public form can still receive spam; a public endpoint must not be treated as a secret. Monitor the submission quota and do not open unexpected links in enquiries.
3. Git history includes a non-private author email address, visible to anyone with repository access. Enable GitHub's private-email setting and use the exact no-reply address shown there for future commits. Existing history was not rewritten.

## Verification and limits

Run `npm run build` before `npx playwright test`. Production-policy browser checks serve `dist` locally using the exact headers in `vercel.json`; they verify inline-script/connection blocking, normal form submission, redirected-request rejection, image animation, and campaign iframe loading. Formspree and YouTube responses are mocked in tests, so they do not send real emails or verify provider availability.

The live domain could not be fetched from this execution environment. After Vercel deploys the changes, check the response headers on `https://mastudio.agency`, play a campaign, and send one live test enquiry. No audit or hosting setup can guarantee zero risk, and account settings and future dependency updates remain important.
