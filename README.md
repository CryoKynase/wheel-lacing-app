# Wheel Weaver

Scaffolded monorepo with a FastAPI backend and a Vite + React frontend.

## Backend (FastAPI)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8007
```

Run tests:

```bash
cd backend
source .venv/bin/activate
pytest -q
```

Health check:

```bash
```

## Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Build for production:

```bash
cd frontend
npm run build
```

The Vite dev server is configured to use port 5177.

## SEO

- Update per-route titles/descriptions in `frontend/src/lib/seo.ts`.
- Add or remove prerendered routes in `frontend/vite.config.ts`.
- Keep `frontend/public/sitemap.xml` in sync with indexable routes.
- Refresh the preview image at `frontend/public/og-image.png` when branding changes.
