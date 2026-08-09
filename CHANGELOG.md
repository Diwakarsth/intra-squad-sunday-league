# Changelog

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
