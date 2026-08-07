# Changelog

## v3.3.3
- Fixed the page flashing between "Connecting to live data..." and "Connected".
- Synchronized index.html, app.js, sw.js, and version.json to the same release.
- Added a one-reload safety guard so mixed GitHub Pages files cannot cause an endless refresh loop.
- Preserved the Live Match Overview/Lineups tabs and fixture lineup display.
- No Firebase data reset is required.

## v3.3.2
- Added Overview and Lineups tabs directly under the live match card.
- Live Lineups tab shows each team logo, saved starting lineup, captain, and substitutions.
- Live, paused, half-time, and completed fixtures can be clicked to expand saved lineups.
- Added team branding to fixture lineup details.
- Preserved Firebase live data, scoring, standings, events, and admin controls.
