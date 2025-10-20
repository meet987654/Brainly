# Brainly (local development)

This README explains how to run the backend and frontend locally for development.

Prerequisites
- Node.js (16+ recommended)
- npm
- MongoDB connection (local or hosted)

Repository layout
- src/ — backend TypeScript source
- frontend/ — Vite + React frontend

Environment variables
Create a `.env` in the repository root with the following values:

MONGODB_URL="your-mongodb-connection-string"
JWT_SECRET="a-strong-secret"
BASE_URL="http://localhost:3000"

Optional for frontend dev proxy
You can set `VITE_BACKEND_URL` to change where the Vite dev server proxies `/api` requests. Default is `http://localhost:3000`.

Run backend

```powershell
# build TypeScript and start backend
cd c:\Users\meetp\OneDrive\Desktop\brainly
npm run build
npm run start
```

Run frontend (development)

```powershell
cd c:\Users\meetp\OneDrive\Desktop\brainly\frontend
# optional: set backend URL for proxy
$env:VITE_BACKEND_URL='http://localhost:3000'
npm run dev
```

Production build (frontend)

```powershell
cd c:\Users\meetp\OneDrive\Desktop\brainly\frontend
npm run build
```

- Notes
- The backend expects the auth token to be sent as the standard `Authorization: Bearer <JWT>` header. The middleware contains a small fallback to accept `token: <JWT>` for older clients.
- CORS is enabled for development. Lock it down for production.
- The backend's DELETE route is `DELETE /api/v1/content/:id`.

If you want, I can also:
- Change auth header to `Authorization: Bearer <token>` (recommended)
- Add basic integration tests that run against the local server
- Add a script to run backend + frontend concurrently

CI
	- Starts a MongoDB service

