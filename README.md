# DeadApp (Backend)

Environment variables
- `PORT` (optional) — port to run the backend (default: `3002` to avoid conflict with Next dev server)
- `MONGO_URI` — MongoDB connection string (required for running)
- `ENCRYPTION_KEY` — passphrase used to derive AES-256 key (required in production)
- `KEYCLOAK_ISSUER_URL` and `KEYCLOAK_AUDIENCE` — for JWT validation with Keycloak
- `ENABLE_DEV_ENDPOINTS` (optional) — set to `true` to enable `/__dev/*` helper endpoints in non-production.

Quick start (recommended)
1. Copy `.env.example` to `.env` and adjust values.
2. Start a local MongoDB (docker or local).
3. Run `npm install` and then `npm run dev`.

Note: Backend default port is `3002`. Ensure `NEXT_PUBLIC_API_URL` on the frontend points to `http://localhost:3002/api`.

Security notes
- Do NOT enable `ENABLE_DEV_ENDPOINTS` in production. Dev endpoints return decrypted secrets for testing only.
- Rotating `ENCRYPTION_KEY` without a migration will render stored passwords irrecoverable.

Start (development)
- `npm run dev` (uses `ts-node-dev`) — ensure `MONGO_URI` points to your local Mongo instance.
