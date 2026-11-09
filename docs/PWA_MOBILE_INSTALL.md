# Homeschool OS — Mobile PWA

Homeschool OS can be installed from its HTTPS website on Android and iPhone. The installed app opens in a standalone window with its own icon.

## Android (Chrome)

1. Open https://homeschool-os-gamma.vercel.app/ in Chrome.
2. Sign in to Homeschool OS.
3. Tap **Install app** in the app navigation. If Chrome displays its own install prompt, confirm it.
4. Open Homeschool OS from the new Home Screen or app-drawer icon.

If the install button is not shown yet, open Chrome's menu (⋮) and look for **Install app** or **Add to Home screen**.

## iPhone or iPad

1. Open https://homeschool-os-gamma.vercel.app/ in Safari.
2. Sign in to Homeschool OS.
3. Tap **Install app** in the app navigation for the instructions.
4. In Safari, tap **Share** → **Add to Home Screen** → **Add**.
5. Launch Homeschool OS from the new Home Screen icon.

## Offline and privacy behaviour

The service worker caches the app's generated icons, versioned Next.js static assets, and a simple offline page. It does **not** cache authenticated pages, API responses, server actions, or learner records. An internet connection is therefore still required to load family plans, update progress, and sync with the database. When offline, the app displays a clear reconnect message rather than showing potentially stale private information.

The app checks for service-worker updates when the browser revisits the site. A refresh after a deployment loads the latest app version.

## Implementation

- `src/app/manifest.ts` defines the install name, start URL, display mode, colours, and icons.
- `src/app/icons/*/route.ts` generates the Android, maskable, and Apple touch icons.
- `src/components/pwa-tools.tsx` registers the service worker and provides the browser install action / iOS guidance.
- `public/sw.js` caches only static assets and the offline page.
