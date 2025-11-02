# Evolution.io

Evolution.io is a simulation project built in TypeScript on top of a lightweight in-house engine (Phoenix.Engine).  
It simulates interactions between carnivores, herbivores and plants on a large procedurally-generated map and produces rich emergent behaviours (hunting, fleeing, reproduction, foraging). The engine is optimized for performance and can handle very large populations (>55k animals on an average machine) while keeping deterministic simulation features and good visual responsiveness.

Key features
- Agent-based ecosystem simulation with emergent behaviour
- Efficient spatial structures and rendering (PixiJS) for large entity counts
- Configurable genetics, movement, combat and reproduction systems
- TypeScript codebase with modular systems for simulation, rendering and UI

# Requirements
Although the app runs entirely in the browser, [*Node.js*](https://nodejs.org/)  (>= 20.x) is required for development to start the local server that serves the static files.

# Run locally

1. Install dependencies:
```pwsh
npm install
```

2. Run the project locally (it should automatically open in a browser tab, otherwise, navigate to [`http://localhost:5173`]()).
```pwsh
npm run dev
```