# Intra Squad Sunday League — v1.1.0

This release adds multi-season and multi-competition support while preserving the existing Season 1 League Firestore data in `league/current`.

## Main navigation
Home • Competitions • Fixtures • Teams • More

A permanent **Viewing: …** competition switcher lets users move between Season 1, Season 2, Super Cups, Dashain Cup 2026 and New Year Cup 2026.

## Data model
- Season 1 League remains in `league/current` (legacy data preserved).
- Future competitions use separate documents such as `league/competition_S2_LEAGUE`.
- Each competition has its own players/roster, fixtures, events, scores, stats and lineups.
- Gallery records are competition-scoped; old gallery records without a `competitionId` remain attached to Season 1 League.
- Competition catalog/current selection is stored in `league/config`.

Always download a backup before major admin changes.
