# Intra Squad Sunday League v1.0.0

Official public release.

## Included
- Firebase Authentication admin login
- Firestore live league data
- Live score, timer, Half Time and Full Time
- Live standings
- Match events, cards, assists, own goals and Player of the Match
- Team sheets, lineups and substitutions
- Team and player management
- Player profiles and Awards
- Match Gallery with photos/videos by fixture
- Admin media uploader
- YouTube/direct media link support
- PWA installation support
- GitHub Pages / Netlify compatible

## Gallery setup
The Gallery can always use **Media Links** (for example YouTube video URLs).

Direct photo/video file upload uses Firebase Cloud Storage. Publish both:
- `firestore.rules` in Firestore Rules
- `storage.rules` in Storage Rules

See `GALLERY_SETUP.md` for details.
