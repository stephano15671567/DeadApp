Backup and Key Rotation
=======================

Safe steps to rotate encryption keys and backup data.

1) Backup current `bovedas` collection (recommended before any rotation):

PowerShell (from `DeadApp`):

```powershell
# Ensure env MONGO_URI is set or available in .env
npm run backup-bovedas
```

This writes a JSON file into `DeadApp/backups/` named `bovedas-backup-<timestamp>.json`.

2) Dry-run validation and rotation:

Set `OLD_ENCRYPTION_KEY` and `NEW_ENCRYPTION_KEY` as environment variables (do not commit keys). Example in PowerShell:

```powershell
$env:OLD_ENCRYPTION_KEY = 'claveVieja'
$env:NEW_ENCRYPTION_KEY = 'claveNueva'
npm run rotate-encryption
```

The script will:
- validate that activos can be decrypted with the old key (dry-run).
- create a backup file before mutating (redundant but safe).
- re-encrypt activos with the new key inside a transaction and record audit entries.

3) Post-rotation checks:

- Use the application or `__dev/get-activos/:usuarioId` (only when `ENABLE_DEV_ENDPOINTS=true` and in development) to confirm decryption with the new key.

Security notes:

- Never store real keys in the repo. Use a secret manager in production.
- Remove or protect `__dev` endpoints in production.
