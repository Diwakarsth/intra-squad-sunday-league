# v1.1.0 — Multi-Competition Release

- Added Competition switcher available from every page.
- Added Competitions hub with Season 1, Season 2, nested Super Cups, Dashain Cup 2026 and New Year Cup 2026.
- Preserved all existing Season 1 League data in the original `league/current` document.
- Added separate Firestore documents for future competition data.
- Added competition-specific rosters, fixtures, events, stats and gallery filtering.
- Added Admin Competition Management: open competition, initialize empty competition, save status, set current competition.
- Added Admin Fixture Management for new competitions.
- Added League + Final support with automatic 1st-place vs 2nd-place finalist resolution.
- Fixed Final match scoring/lineups/events so placeholder finalists resolve to actual team IDs.
- Simplified navigation to Home / Competitions / Fixtures / Teams / More.
- Combined goals, assists, cards and POTM under Stats.
- Added player profile scopes: This Competition / This Season / Career.
- Home standings now shows the complete table instead of “Top 3”; mobile tables can scroll horizontally.
- League + Final standings visually mark the Top 2 qualification line.
- Gallery uploads now include the selected competition ID; legacy media stays with Season 1.
- Backup/Restore now operates on the selected competition and its gallery records instead of deleting media from other competitions.
- New PWA cache/version: 1.1.0.

# Changelog

## v1.0.13 — Automatic Finalists
- Final displays 1st Place vs 2nd Place while league-stage matches are still in progress.
- After all six league-stage matches are completed, the Final automatically displays the actual first- and second-place team names and logos from the live standings.
- No completed match data, goals, cards, Gallery records, standings, or player statistics are reset.



## v1.0.12 — Top Scorers Visibility
- Increased goal-total contrast and size on the Top Scorers page.
- Goal numbers now use a dedicated bright-blue style.
- Improved the mobile scorer-row grid so the goal total stays fully visible on narrow phone screens.
- GOALS label remains directly below each number.



## v1.0.11 — Gallery Remove Action Fix
- Fixed the actual Remove Photo issue: the click handler previously existed only inside the Admin media-management list.
- Added a global delegated Gallery remove handler so dynamically rendered Remove Photo / Remove Video buttons work from the main Gallery and other Gallery views.
- Added removing-state feedback and clearer error handling.
- Removal deletes only the selected Firestore Gallery record; other photos remain unchanged.



## v1.0.10 — Visible Gallery Remove Control
- Admin Remove Photo / Remove Video button is now displayed directly on every Gallery media card, including match-specific galleries such as Jhyap Warriors matches.
- Increased mobile visibility and tap size of the remove control.
- Removal still affects only the selected Gallery record.



## v1.0.9 — Gallery, Schedule, Teams & Future Events
- Added General League Gallery uploads while keeping match-specific photo uploads.
- Updated remaining August 16 and August 23 fixtures; August 30 Final remains unchanged.
- Added Team Owner and Sponsors above each team player list.
- Added Future Events tab with the August 30 through January 3 schedule.
- Replaced Next Match with an auto-sliding Upcoming Fixtures card showing all remaining fixtures.
- Completed fixture details now show goals and yellow/red cards under the respective team with event minutes.
- Existing finished match data remains untouched; schedule changes apply only to unfinished M3–M6 fixtures.



## v1.0.8 — Gallery Remove Photo
- Admins now see **Remove Photo / Remove Video** directly on each item in the Gallery tab.
- Removing one Gallery item deletes only that Firestore Gallery record, so other uploaded photos remain untouched.
- Added a confirmation message before removal.
- Existing Cloudinary files are not deleted by the browser; only the selected item is removed from the league website.



## v1.0.7 — Visible Scores & Scorer Minutes
- Changed every match/result score to the same high-contrast blue so scores remain visible on the dark theme.
- Goal minute now appears immediately after each scorer name.
- Applied to Latest Results, completed fixtures, and match result summaries.
- Keeps the v1.0.6 Admin Backup & Restore feature.



## v1.0.6 — Admin Backup & Restore
- Added Download League Backup under Admin.
- Backup JSON includes teams, players, fixtures, scores, lineups, substitutions, match events, settings, and Gallery media records/links.
- Added Restore Selected Backup with two confirmation prompts.
- Restore replaces the live Firestore league document and Gallery records with the selected backup.
- Existing Cloudinary photo URLs/public IDs are preserved in backup records.



## v1.0.5 — Results & Team Player Statistics
- Latest Results now shows every completed match with the most recently completed game first.
- Scores are shown prominently for every completed result.
- Goal scorers and own-goal labels are shown beneath the respective teams.
- Completed fixture details now repeat the full-time score and scorers above lineups.
- Removed the standalone Players navigation tab and Players quick link.
- Team pages now show every player's goals, assists, yellow cards, red cards and POTM count directly under the respective team.
- Player names on Team pages remain clickable and open the existing detailed player profile.



## v1.0.4 — Mobile Header Fix
- Removed Download App Icon from the public header.
- Kept Install App visible to everyone.
- Rebuilt the mobile header so the league logo/name/status no longer overlap the Install/Admin buttons.
- Install App and Admin Login now share a clean two-button row on phones.
- Improved mobile navigation sizing and horizontal scrolling.



## v1.0.3 — Install & App Icon Download
- Install App button is visible to all visitors.
- Native PWA install prompt is used when available.
- iPhone/iPad users get Add to Home Screen instructions when needed.
- Added Download App Icon using the 1024px league icon.
- Admin Login remains separate.



## v1.0.2 — Direct Photo Upload
- Fixed League Activity card so completed/total match counts render dynamically instead of showing template code.
- Admin can select photos directly from phone or laptop.
- Multiple-photo selection supported.
- Photos are assigned to the selected match automatically.
- Added upload progress.
- Added Admin-only Remove Photo / Remove Video controls.
- Videos remain link-based to conserve storage.
- Uses Cloudinary direct unsigned image upload instead of Firebase Storage.
- Firebase can remain on the Spark plan.
- Added PHOTO_UPLOAD_SETUP.md for one-time Cloudinary configuration.

## v1.0.0 — Official Public Release
- Rebranded the stable league app as the first official public release.
- Added a public Gallery tab.
- Gallery media is grouped under the respective fixture.
- Added a Gallery tab inside the live match.
- Completed/live fixture details now show media from that game.
- Added admin file upload for photos and videos.
- Added upload progress.
- Added YouTube/direct media link support.
- Added admin media removal.
- Added public-read/admin-write Firestore rules for match media.
- Added Firebase Storage rules for uploaded match media.
- Replaced the fixed-date calendar emoji in key Home/Fixtures shortcuts with a date-neutral calendar icon.
