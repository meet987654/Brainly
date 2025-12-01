# Brainly

This README explains how to run the backend and frontend locally for development, along with deployed production URLs.

##  Deployed URLs
Frontend (Production): **https://brainly-silk.vercel.app/**  
Backend (Production API): **https://brainly-7s68.onrender.com**

---

##  Prerequisites
- Node.js (16+ recommended)
- npm
- MongoDB connection (local or hosted)

---

## Repository Layout
```
src/        → backend TypeScript source
frontend/   → Vite + React frontend
```

---

##  Environment Variables
Create a `.env` file in the project root:

```env
MONGODB_URL="your-mongodb-connection-string"
JWT_SECRET="a-strong-secret"
BASE_URL="http://localhost:3000"
```

### Optional (Frontend Dev Proxy)
Inside `frontend/.env`:

```env
VITE_BACKEND_URL="http://localhost:3000"
```

---

##  Run Backend

```powershell
cd c:\Users\meetp\OneDrive\Desktop\brainly
npm run build
npm run start
```

---

## Run Frontend (Development)

```powershell
cd c:\Users\meetp\OneDrive\Desktop\brainly\frontend

# optional: set backend URL for proxy
$env:VITE_BACKEND_URL='http://localhost:3000'

npm run dev
```

---

## Production Build (Frontend)

```powershell
cd c:\Users\meetp\OneDrive\Desktop\brainly\frontend
npm run build
```

---

## Notes
- The backend expects the auth token in the standard header:
  ```
  Authorization: Bearer <JWT>
  ```
  (A fallback also accepts `token: <JWT>` for older clients.)

- CORS is enabled for development. Lock it down for production.

- DELETE route:
  ```
  DELETE /api/v1/content/:id
  ```

---

## 🧪 CI
- Automatically starts a MongoDB service for tests.

