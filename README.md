# Intra Squad Sunday League — v1.1.1

Mobile-first multi-competition league website with Firebase live data and Cloudinary gallery uploads.

## v1.1.1 highlights
- Cleaner mobile Home page; the redundant **CURRENT VIEW** badge is removed.
- Home standings keeps the full table but is compact enough for phone screens.
- Admin can create future competitions directly from the website.
- Admin can initialize, set status, open, cancel, or safely delete a competition that never happened.
- Season 1 League is protected from competition deletion.
- Competitions containing played-match data/events cannot be permanently deleted; mark them Completed or Cancelled instead.
- Team Management supports add, edit, remove, transfer, and captain changes for the selected competition roster.
- Fixture Management supports add, edit/reschedule, and delete.
- Competition start/end dates automatically follow the earliest and latest fixture dates.
- League + Final competitions support automatic 1st Place vs 2nd Place finalists.
- Gallery remains competition-specific and can optionally be tied to a fixture.

Existing Season 1 Firebase data remains in `league/current` and is not migrated or overwritten by this release.
