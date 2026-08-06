# Intra Squad Sunday League v3.1.8

Firebase-powered public league tracker with admin controls.

## Fixes in v3.1.8
- Half Time now pauses and saves the match clock and shows HALF TIME publicly.
- Start Second Half resumes the same match clock.
- Live standings accept numeric Firestore scores reliably and update during Live, Paused, and Half Time states.
- Team Management now uses a simple form: Current Team, Player, Action, and Destination Team.
- Admin can remove a player from a roster or transfer a player while preserving historical events.
- New events save the player's team at the time of the event, so later transfers do not move old goals/cards to the new team.

## Deploy
Extract the ZIP and upload every file from the project folder to the root of the GitHub repository. Commit and wait for GitHub Pages deployment. Confirm the footer shows v3.1.8.
