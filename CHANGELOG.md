# Changelog

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
