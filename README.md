# Intra Squad Sunday League — Firebase Version 3

Public league app hosted on GitHub Pages with live shared data in Cloud Firestore.

## Features
- Public fixtures, standings, teams, players, and Top Scorers
- Firebase Email/Password admin login
- Admin-only score, player, and event updates
- Real-time Firestore synchronization across users' devices
- PWA/offline asset caching

## Required Firebase setup
1. Enable Email/Password in Firebase Authentication.
2. Create the admin user `admin@intrasquadleague.com` with your chosen password.
3. Add `diwakarsth.github.io` to Authentication > Settings > Authorized domains.
4. Publish the rules in `firestore.rules` from Firestore Database > Rules.

## Deployment
Upload all extracted files to the root of the GitHub repository. Do not upload only the ZIP. Wait for GitHub Pages to deploy, then test in an Incognito window.


## Version 3.1
Adds a Firebase-synced Live Match Center and admin League Control Center with start, pause, resume, live scoring, clock, event timeline, and full-time finalization.


## Version 3.1.1
- Home page live game card with LIVE/PAUSED state
- Running timer and live score
- Goal scorers list and full event timeline
- Event minute auto-filled from live clock when left blank


## Version 3.1.6
- Optional live standings during active or paused matches
- Public LIVE TABLE notice with current score and timer
- Admin toggle in League Control Center


## Version 3.1.7 - Half Time
- Admin Half Time button in League Control Center
- Match clock pauses at half time
- Public Home live card, Fixtures, and Control Center show HALF TIME
- Resume button changes to Start Second Half
- Live standings continue to include the half-time score
