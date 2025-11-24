# DeadApp (Backend)

Environment variables
- `PORT` (optional) — port to run the backend (default: `3000`)
- `MONGO_URI` — MongoDB connection string (required for running)
- `ENCRYPTION_KEY` — passphrase used to derive AES-256 key (required in production)
- `KEYCLOAK_ISSUER_URL` and `KEYCLOAK_AUDIENCE` — for JWT validation with Keycloak
- `ENABLE_DEV_ENDPOINTS` (optional) — set to `true` to enable `/__dev/*` helper endpoints in non-production.

Security notes
- Do NOT enable `ENABLE_DEV_ENDPOINTS` in production. Dev endpoints return decrypted secrets for testing only.
- Rotating `ENCRYPTION_KEY` without a migration will render stored passwords irrecoverable.

Start (development)
- `npm run dev` (uses `ts-node-dev`) — ensure `MONGO_URI` points to your local Mongo instance.
