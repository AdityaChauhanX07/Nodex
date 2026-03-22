# Nodex

**Your Face Is the Remote**

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Face_Mesh-4285F4?logo=google&logoColor=white)](https://google.github.io/mediapipe/solutions/face_mesh)

Nodex lets you control YouTube with head movements and facial gestures. No hands, no keyboard. We built it for the Rhodes College Hackathon 2026. MediaPipe Face Mesh runs entirely in your browser at roughly 30–60fps.

## Gesture reference

| Gesture | Action |
|---------|--------|
| Turn head left | Previous video |
| Turn head right | Next video |
| Nod up | Volume up |
| Nod down | Volume down |
| Tilt left | Rewind 10s |
| Tilt right | Skip 10s |
| Open mouth | Play / Pause |
| Close eyes (hold) | Mute / Unmute |

## Getting started

```bash
git clone <your-repo-url>
cd Nodex
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173), calibrate your face, then paste a YouTube URL.

## How it works

MediaPipe Face Mesh tracks 468 facial landmarks from your webcam at about 30fps. We derive yaw, pitch, and roll from that geometry so head pose maps to commands.

Calibration stores a neutral pose so your resting face does not count as a gesture. On top of raw angles we use hysteresis and per-gesture cooldowns so small jitter does not fire volume or skip by accident.

The YouTube IFrame API drives playback. Our code talks to the embedded player the way the API expects, including `postMessage` where the browser requires it.

## Stack

React 18, Vite 5, Tailwind CSS 3, Framer Motion, MediaPipe Face Mesh, YouTube IFrame API, and PWA support via `vite-plugin-pwa`.

## Known limitations

Good lighting helps a lot. Dim rooms make landmarks noisy and gestures unreliable.

Glasses can throw off eye aspect ratio, so blink and close-eye detection may need a calmer threshold or better light.

YouTube embeds expect a proper origin. In production you want HTTPS (Vercel gives this out of the box). Local dev on `http://localhost` is fine.

We have not tuned or tested this on mobile browsers.

## Deploy

The project is set up for Vercel: connect the repo and deploy. `vercel.json` rewrites all routes to `index.html` so client-side routing keeps working.
