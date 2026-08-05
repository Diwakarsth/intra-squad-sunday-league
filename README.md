# Intra Squad Sunday League — Version 2.0

## Open the app
For a quick preview, open `index.html` in a browser.

For reliable offline/install behavior, open a terminal in this folder and run:

    python -m http.server 8000

Then visit `http://localhost:8000`.

## Admin login
- Username: `admin`
- Password: `SundayLeague2026!`

The Admin tab is hidden until login. The admin session lasts until logout or the browser tab/session is closed.

## Version 2.0 features
- Full team names throughout the app
- Team logos, jerseys, captains, and complete player lists
- Fixtures, results, and automatic standings
- Dedicated Top Scorers tab ranked by goals, then assists
- Player goals, assists, cards, and Player of the Match statistics
- Admin-only result, player, and match-event controls
- Mobile-friendly layout and offline cache
- Local browser data storage

## Security note
This is a browser-only offline app. Its login is suitable for basic local access control, but it is not secure enough for a public website because credentials exist in the JavaScript file. Proper online security requires Firebase, Supabase, or another server-based authentication system.
