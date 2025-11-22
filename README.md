<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/15xDQjTAwb9o5sOz-7EEjprUDWfkEQs_K

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Secrets & Environment

- **Do not commit** real secrets (for example, `server/.env`) to source control.
- Copy `server/.env.example` to `server/.env` and fill in real values before running the backend.
- To generate a secure JWT secret locally (PowerShell):

```powershell
# Generate 32 random bytes and encode as Base64
[System.Convert]::ToBase64String((New-Object System.Security.Cryptography.RNGCryptoServiceProvider).GetBytes(32))
```

- Example backend setup (PowerShell):

```powershell
cd server
npm install
# create .env from example
copy .env.example .env
# Edit server/.env and paste the generated JWT_SECRET value
npm start
```

If this repository has already committed a secret, rotate it immediately and remove it from version control history.
