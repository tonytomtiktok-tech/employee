# Deployment

1. Private GitHub repo (source/CI only — never commit assessment responses).
2. Host on managed Node.js with HTTPS and server secrets.
3. Configure Auth and (later) Sheets env vars from `.env.example`.
4. Run `npm run build` and deploy `.next` / Node server.
5. Keep spreadsheet private; service account least privilege; rotate keys.
