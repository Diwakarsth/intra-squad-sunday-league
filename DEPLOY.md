# Deploy v1.1.4 to GitHub first

1. Download a league backup from the current website before changing production files.
2. Keep Netlify Auto Deploy OFF while testing.
3. Upload/commit **all files inside this v1.1.4 ZIP** to the GitHub repository root, replacing the previous release files.
4. No Firestore rule change is required if the existing rules already allow admin writes under `/league/*` and `/matchMedia/*`.
5. Test the GitHub/Pages preview on desktop and phone.
6. Log in as Admin and verify **Season 1 • League** still shows the existing data. Do not restore a backup if the data appears normally.
7. Test creating a temporary empty competition, adding a player, adding/editing a fixture, and confirming the displayed competition dates update automatically. Delete the temporary competition before production if desired.
8. After testing, manually deploy the same files to Netlify.

Installed PWAs use cache `issl-v1.1.4` and the version checker will refresh stale app files.

## v1.1.3 check
After deployment, complete or open a completed test fixture in Admin → League Control Center and confirm the POTM Recommendation card appears. Selecting a candidate should create exactly one Player of the Match event for that fixture.


## v1.1.4 check
1. In Admin, verify the intended competition is marked **Current**.
2. Browse a different competition.
3. Reload or reopen the website. Home should return to the Admin-selected Current competition.
4. Confirm Season 1 data, standings, fixtures, gallery, and POTM features are unchanged.
