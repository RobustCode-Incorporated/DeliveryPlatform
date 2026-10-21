# Security Policy

This policy covers the ROBUST DELIVERY PLATFORM repositories:
DeliveryPlatform (this hub), RDP-Backend, RDP-Frontend and RDP-Mobile.

## Reporting a vulnerability

- Do **not** open a public GitHub issue for security problems.
- Report privately, either through GitHub's **"Report a vulnerability"**
  (Security tab > Advisories) on the affected repository, or contact the
  RobustCode-Incorporated organization owner directly.
- Include the affected repository, a description, steps to reproduce and the
  impact you expect. If you found a leaked credential, say where (repo, commit,
  file) but do **not** paste the secret itself.
- We aim to acknowledge reports within 3 working days.

## Rule: never commit secrets

- Never commit passwords, database URLs with credentials, JWT signing keys,
  API keys, tokens, private keys or `.env` files to any repository — not even
  "temporarily" and not in `*.example` files. Git history is permanent and these
  repositories have been public.
- Commit only templates with placeholders (`.env.example`,
  `.env.render.example`), e.g. `NEON_DB_PASSWORD=YOUR_NEON_PASSWORD`.
- Real values live in Render environment variables (production) or in local,
  git-ignored `.env` files (development).
- If a secret is committed by mistake: **rotate it first**, then remove it from
  the code. Deleting the line does not remove it from history.
- Do not log JWTs, passwords or personal data (customer addresses, phone numbers).

## Owner checklist (before the restaurant pilot)

- [ ] **Rotate the Neon database password** (`neondb_owner`). The previous
      password is exposed in the public history of DeliveryPlatform
      (commits 5baa1c6, fdb3fb0, c24bc69, be8cd06, db6c35c). Consider also
      rotating the Neon endpoint/role if possible, and review Neon access logs.
- [ ] **Set Render environment variables** for the backend (`NEON_JDBC_URL`,
      `NEON_DB_USERNAME`, `NEON_DB_PASSWORD`, JWT signing secret,
      `APP_CORS_ALLOWED_ORIGINS`) and the frontend (`VITE_API_BASE_URL`), then
      redeploy. Make sure the JWT signing secret is not a hard-coded constant in
      the code and is rotated (an older hard-coded key exists in history).
- [ ] **Make the repositories private** (DeliveryPlatform, RDP-Backend,
      RDP-Frontend, RDP-Mobile).
- [ ] **Enable GitHub secret scanning and push protection** on every
      repository (Settings > Code security).
- [ ] Remove or change the passwords of seeded test accounts
      (`*@test.com`, `*.test`) on the production database before real
      restaurants and drivers use it.
