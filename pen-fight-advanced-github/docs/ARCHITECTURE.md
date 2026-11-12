# Architecture

Pen Fight Advanced is a client-side static web application. There is no server, database, authentication layer, or external API.

## Runtime flow

1. `index.html` defines the HUD, game canvas, overlay, and control buttons.
2. `css/styles.css` defines layout, responsive sizing, colors, and controls.
3. `js/game.js` initializes the canvas and owns all game behavior.
4. The browser animation loop updates physics and renders the scene.

## Main systems in `js/game.js`

| System | Responsibility |
|---|---|
| Setup | Canvas dimensions, arena geometry, pen types, and match state |
| Sound | Web Audio API tone generation and mute state |
| Physics | Pen movement, friction, collision detection, impulse response, and out-of-bounds checks |
| Game state | Turns, rounds, scores, sudden death, and match completion |
| AI | Direction and flick-strength selection for three difficulty levels |
| Input | Pointer events and keyboard shortcuts |
| Rendering | Desk texture, pens, trails, aim indicator, particles, and overlays |

## State model

The game uses a small state machine:

- `menu`: configuration screen
- `aim`: current player selects a flick
- `moving`: pens are moving and collisions are simulated
- `shrink`: sudden-death desk animation
- `ending`: a pen has left the desk; round-end delay
- `over`: round or match result is displayed

## Physics overview

Pens are represented as oriented rectangles. Collision detection uses the separating-axis theorem over the local axes of both pens. Collision response applies an impulse that accounts for linear velocity, angular velocity, and pen mass. Friction gradually reduces movement until the next turn begins.

## Extension points

Potential future modules include:

- Persistent settings and match history (`localStorage`)
- Online multiplayer and authoritative server simulation
- Gamepad support
- Configurable arena and tournament modes
- Automated unit tests for collision and scoring rules

These are ideas only; they are not currently implemented.
