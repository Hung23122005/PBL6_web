# PhishGuard AI frontend

A React + TypeScript research dashboard for AI-assisted phishing website detection. It connects to the local FastAPI backend and shows model readiness. It never generates demo predictions.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env.local`. Set `VITE_API_URL` in `.env.local` to the FastAPI origin, for example `http://127.0.0.1:8000`. Restart Vite after changing environment variables. Without an environment file, the frontend uses `http://127.0.0.1:8000`.

```bash
npm run build
npm run lint
```

## API integration

The client connects to the U-PIG backend at http://127.0.0.1:8000 by default. Set VITE_API_URL to override it; restart Vite after changes.

| Endpoint | Purpose |
| --- | --- |
| GET /health | Model readiness (model_loaded) |
| GET /api/v1/model | U-PIG availability and architecture |
| POST /api/v1/predict | URL-only prediction |
| POST /api/v1/scans | Queue a crawl and prediction with { "url": "https://example.org/" } |
| GET /api/v1/scans/{scan_id} | Poll every second until completed or failed |

The scanner waits up to three minutes, displays backend job errors, and cancels polling when leaving the scanner. Cancelling polling does not stop the backend job. The result shows the actual inference mode, validation threshold, HTML/screenshot capture statuses, final URL and any fallback warning. U-PIG returns one selected mode per scan; other modes remain unavailable. Captured PNG previews are held in backend memory for up to 30 minutes (30 images maximum, 6 MB each). The result includes screenshot_url; GET /api/v1/screenshots/{preview_id} returns the image. Expired or evicted previews return 404. Restarting the backend clears previews. Preview URLs are not stored in browser history.

The U-PIG backend allows localhost:5173 and 127.0.0.1:5173 by default. Set CORS_ORIGINS for another frontend origin and restart the backend. For local development keep API_KEY empty; secret API keys must use a server-side proxy instead of VITE variables.

Configure CORS on FastAPI for the frontend origin. The backend must validate outbound URLs against SSRF and isolate any browser automation used for website crawling. If secret authentication is needed, put it in a server-side proxy; `VITE_*` variables are visible to browsers and must never contain secrets.

## Local history

Successful results are saved in browser `localStorage` (up to 100). Query strings, fragments, URL credentials, and screenshots are excluded from saved history. The dashboard uses these records; detection rate only appears when saved results include ground-truth labels. Clearing history removes browser-local records only. This storage layer can later be replaced with a database-backed API.
# PBL6_web
