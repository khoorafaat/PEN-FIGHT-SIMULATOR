# Development guide

## Prerequisites

A modern browser is sufficient. Python 3 or Node.js is optional and only needed to run a local static server.

## Local workflow

```bash
git clone https://github.com/<your-username>/pen-fight-advanced.git
cd pen-fight-advanced
python -m http.server 8000
```

Visit <http://localhost:8000>.

## Making changes

- Keep markup in `index.html`.
- Keep presentation rules in `css/styles.css`.
- Keep game logic in `js/game.js`.
- Keep documentation in `docs/`.
- Avoid adding dependencies unless a clear requirement justifies them.
- Test both two-player and AI modes after changing turn, collision, or scoring logic.
- Test mouse and touch input after changing pointer handling.
- Check the browser console for errors.

## Manual regression checklist

- [ ] Main menu loads and all configuration fields work.
- [ ] Both players can select pen types.
- [ ] Two-player mode alternates turns.
- [ ] Easy, Normal, and Hard AI modes take a turn.
- [ ] A flick moves the active pen in the expected direction.
- [ ] Boost is available once per player per round.
- [ ] Pause and resume work.
- [ ] Sound can be muted and unmuted.
- [ ] A pen leaving the desk awards the round correctly.
- [ ] First to three rounds ends the match.
- [ ] Sudden-death desk shrinking works when enabled.
- [ ] Layout remains usable on narrow screens.
