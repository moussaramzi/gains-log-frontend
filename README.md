# Gains Log — frontend

Static frontend for the Gains Log gym tracker. This used to be a Netlify
site with its own Netlify Functions backend (Netlify Blobs); that backend
now lives in a separate repo, [`gains-log-backend`](../gains-log-backend),
so it can be hosted anywhere with a persistent process (Railway, Render, a
VPS, etc.) instead of relying on Netlify Blobs — which had a noticeable
read-after-write lag (a check-in would briefly show as unchecked after a
refresh).

## Setup

1. Deploy `gains-log-backend` first and note its public URL.
2. Edit `public/config.js` and set:
   ```js
   window.GAINS_LOG_API_BASE = "https://your-backend-url.example.com";
   ```
3. Deploy this repo to Netlify (or any static host) — it's a single static
   site, `public/` is the publish directory, no build step and no
   serverless functions needed.

## Local preview

```bash
npx serve public
```

(or any static file server) — just make sure `public/config.js` points at a
running backend first.
