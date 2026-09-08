# v1.1.3 — POTM Recommendation

- Added automatic Player of the Match recommendations after a fixture reaches Full Time.
- Recommendations use recorded match events: goals and assists add weight; yellow/red cards and own goals reduce it.
- Shows up to three candidates, with the strongest candidate first.
- Admin must confirm the POTM; the site never awards it automatically.
- Selecting a different candidate replaces the existing POTM for that fixture, preserving the one-POTM-per-match rule.
- v1.1.2 responsive non-scroll standings behavior is preserved.
- PWA/app version and cache updated to 1.1.3.

# v1.1.2 — Responsive Standings

- Standings tables now fit the available screen width on phone, tablet, laptop, and desktop.
- Removed horizontal scrolling from both Home standings and the full Standings page.
- Desktop/laptop keeps a full readable table with all columns visible at once.
- Phone layouts use compact typography, spacing, and hidden mini logos to preserve all table columns without page/table scrolling.
- No qualification dotted line or extra standings decoration is added.
- Existing competition management, roster management, fixture management, gallery, and Firebase data behavior from v1.1.1 are preserved.
- PWA/app version updated to 1.1.2 and cache updated to `issl-v1.1.2`.

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
