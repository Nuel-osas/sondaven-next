# Son Daven — Next.js rebuild

A local Next.js App Router reconstruction of [sondaven.com](https://sondaven.com), with 27 public routes in Ukrainian and English. Pages are editable React components, with local photography, fonts, video, audio, frame sequences, galleries, and the original authored canvas effects adapted to a React lifecycle.

## Run

Requires Node.js 22 or later and npm. Browser checks use an installed Chrome/Chromium; set `CHROME_PATH` if it is not detected automatically.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4182. For a production preview:

```sh
npm run build
npm start
```

## Structure

- `app/`: native Next.js pages and metadata.
- `components/sections/`: editable sections, shared between pages.
- `lib/experience.js`: scoped GSAP, Swiper, Lenis, and canvas animation lifecycle.
- `public/assets/`: local media and fonts.
- `docs/routes.json`: full route inventory.
- `scripts/migrate*.mjs`: one-time reconstruction tools; their ignored reference inputs are not needed to run, build, or test the app.

Contact forms simulate success locally and never send messages. YouTube/Vimeo videos load only after an explicit play action and require internet access. Empty video IDs in the source remain unavailable. The primary hero sequences and supplied MP4s are local.

## Verify

```sh
npm run build
npm run typecheck
npm test
```

`npm test` launches a temporary production server and checks all 27 routes at desktop and mobile sizes, images, overflow, console/network errors, menus, FAQ, gallery controls, local form submission, and native language navigation. To check an existing server: `TEST_BASE_URL=http://127.0.0.1:4182 npm test`.

Reconstructed from the public site on 14 October 2026 using D-j-View capture. It is a recreation of public presentation and interactions; it does not contain the original private source or backend. Live source preloader behavior prevented a complete pixel comparison; no claim of pixel-perfect equivalence is made.
