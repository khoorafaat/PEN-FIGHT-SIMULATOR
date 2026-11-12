# Pen Fight Advanced

A browser-based, physics-driven pen flicking game. Play locally with two players or challenge the computer across three difficulty levels.

## Features

- Two-player local mode and single-player vs. computer mode
- Three AI difficulty levels: Easy, Normal, and Hard
- Four pen types: Classic, Heavy, Speedy, and Slick
- Flick-based controls with a once-per-round boost
- Collision physics, spin, trails, impact particles, and sound effects
- Optional sudden-death mode that gradually shrinks the desk
- First player to win three rounds takes the match
- Responsive canvas layout with light/dark theme support
- Keyboard and pointer/touch controls

## Run locally

This is a static web project. It does not require a build step, package installation, backend, or API key.

### Option 1: Python

From the project root:

```bash
python -m http.server 8000
```

Open <http://localhost:8000> in your browser.

### Option 2: Node.js

If you already have Node.js installed, you can use any static file server, for example:

```bash
npx serve .
```

## How to play

1. Choose **Two players** or **Play the computer**.
2. Select a pen type for Blue and Red.
3. Choose the computer difficulty if playing against AI.
4. Choose whether sudden death (desk shrinking) is enabled.
5. Drag or pull back from your pen, then release to flick it.
6. Push the opponent's pen off the desk. The first to three round wins takes the match.

### Controls

| Action | Control |
|---|---|
| Aim and flick | Pointer, mouse, or touch: drag from the active pen and release |
| Arm boost | `Space` or the Boost button |
| Pause / resume | `P` or the Pause button |
| Toggle sound | `M` or the Sound button |

## Project structure

```text
pen-fight-advanced/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── game.js
├── assets/
│   └── favicon.svg
├── docs/
│   ├── ARCHITECTURE.md
│   └── DEVELOPMENT.md
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   ├── workflows/
│   │   └── pages.yml
│   └── PULL_REQUEST_TEMPLATE.md
├── .gitignore
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── LICENSE
├── SECURITY.md
└── README.md
```

## Deployment

### GitHub Pages

1. Push this repository to GitHub.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, choose **GitHub Actions** as the source.
4. The included workflow deploys the static site when changes are pushed to the `main` branch.
5. Open the Pages URL shown by GitHub after the workflow succeeds.

You can also host the project on Netlify, Vercel, or any static hosting provider. Set the publish/root directory to the repository root; no build command is needed.

## Technology

- HTML5
- CSS3
- Vanilla JavaScript
- HTML Canvas 2D API
- Web Audio API

No external runtime dependencies are used.

## Browser compatibility

Use a current version of Chrome, Firefox, Safari, or Edge. Audio may remain silent until the browser receives a user interaction, due to browser autoplay policies.

## Known limitations

- Multiplayer is local on the same device; there is no online matchmaking or networking.
- Match scores and settings are held in memory and reset when the page is reloaded.
- The game uses a fixed logical canvas size and scales it to the available display width.

## Contributing

Bug reports, feature requests, and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting changes.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
