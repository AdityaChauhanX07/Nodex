# Nodex

> Your Face Is the Remote — hands-free media control using facial gestures.

## Overview

Nodex uses [MediaPipe Face Mesh](https://google.github.io/mediapipe/solutions/face_mesh) to detect facial landmarks in real-time via your webcam, then translates head movements and facial expressions into media control commands.

**Runs entirely in the browser. No backend required.**

## Gesture Map

| Gesture | Default Command |
|---------|----------------|
| Nod Up | Volume Up |
| Nod Down | Volume Down |
| Turn Left | Previous / Rewind |
| Turn Right | Next / Skip |
| Close Both Eyes | Play / Pause |
| Open Mouth Wide | Mute / Unmute |
| Tilt Left | Rewind 10s |
| Tilt Right | Skip 10s |

## Setup

```bash
npm install
npm run dev
```

## Spotify Setup

1. Create a Spotify app at [developer.spotify.com](https://developer.spotify.com)
2. Add `http://localhost:5173/callback` to Redirect URIs
3. Set your `clientId` in `useSpotify.js`
4. Requires Spotify Premium

## PWA Icons

The `public/icons/` directory needs real PNG files for the PWA service worker:
- `icon-192.png` — 192×192 px
- `icon-512.png` — 512×512 px

You can generate these from `public/favicon.svg` using any image editor or an online SVG-to-PNG converter.

## Tech Stack

- React 18 + Vite
- Tailwind CSS v3
- Framer Motion
- MediaPipe Face Mesh
- YouTube IFrame API
- PDF.js
- Workbox (PWA via vite-plugin-pwa)

## Deploy

```bash
npm run build
# Deploy dist/ to Vercel
```

The `vercel.json` at the project root handles SPA routing rewrites.
