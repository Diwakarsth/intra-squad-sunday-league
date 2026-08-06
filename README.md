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
