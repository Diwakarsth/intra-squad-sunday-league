# v1.1.1 — Mobile & Competition Management

## Home / mobile
- Removed the redundant `CURRENT VIEW` badge below the tournament/competition name.
- Simplified Home quick links to Fixtures, Teams, Stats and Gallery.
- Tightened Home spacing and cards for smaller phone screens.
- Full Home standings table remains visible with `# Team P W D L GD Pts`, using compact phone sizing instead of forcing page-wide overflow.
- Added additional width/overflow safeguards for mobile cards and grids.

## Competition management
- Added Create New Competition from Admin (no code release required for ordinary future competitions).
- Added Cancelled competition status.
- Added safe Delete Competition for competitions that did not happen.
- Season 1 League cannot be deleted.
- Current competition cannot be deleted or demoted until another competition is set Current.
- Competitions with played/live match data or recorded events cannot be permanently deleted; use Completed/Cancelled instead.
- Permanent deletion requires typing the competition name.
- Competition Firestore document and its Firestore gallery records are removed; Cloudinary originals are not deleted.

## Teams / rosters
- Team Management is competition-scoped.
- Added Edit Player to change player name, jersey number and position.
- Existing Add, Remove, Transfer and Change Captain actions remain available.

## Fixtures / dates
- Admin can create, edit/reschedule and delete fixtures from the website.
- Competition date range automatically recalculates from the earliest to latest scheduled fixture.
- League + Final competitions keep `1st Place vs 2nd Place` Final placeholders and automatic finalist resolution.

## Data safety
- Existing Season 1 data remains in `league/current` and is not migrated or overwritten.
- Firestore rules remain unchanged.
- PWA/app version updated to 1.1.1 and cache updated to `issl-v1.1.1`.
