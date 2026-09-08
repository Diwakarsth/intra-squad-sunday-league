# Deploy v1.1.0 to GitHub Pages / Netlify

1. Download a League Backup from the current Admin panel before deployment.
2. Upload/commit **all files in this ZIP** to the repository root, replacing the previous release files.
3. Keep `firestore.rules` unchanged unless your live Firebase rules are older than the included file. The multi-competition data stays under `/league/*`, so the existing admin-only write rule continues to work.
4. Wait for GitHub Pages / Netlify to finish the deploy.
5. Open the live site once in a normal browser and once on mobile/PWA. If an installed PWA shows the old build, close and reopen it; v1.1.0 uses a new cache name and version check.
6. Log in as admin and verify Season 1 League data before initializing any new competition.
