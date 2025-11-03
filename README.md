# Evolution.io

## Overview

<p align="center">
	<img src="public/assets/showcase.webp" alt="Evolution.io showcase" />
</p>

Evolution.io is a simulation project built in TypeScript on top of a lightweight in-house engine (Phoenix.Engine).  
It simulates interactions between carnivores, herbivores and plants on a large procedurally-generated map and produces rich emergent behaviours (hunting, fleeing, reproduction, foraging). The engine is optimized for performance and can handle very large populations (>55k animals on an average machine) while keeping deterministic simulation features and good visual responsiveness.

## Table of contents

- [Structure](#structure)
- [Key features](#key-features)
- [Requirements](#requirements)
- [Run locally](#run-locally)
- [Licence](#licence)


## Key features
- Agent-based ecosystem simulation with emergent behaviour
- Efficient spatial structures and rendering (PixiJS) for large entity counts
- Configurable genetics, movement, combat and reproduction systems
- TypeScript codebase with modular systems for simulation, rendering and UI


## Structure

The project uses multithreading to run rendering and physics loops in parallel. Rendering-related systems (camera, layers, UI, input handling, etc.) are implemented in `src/rendering`. Physics, AI, and entity interaction logic are located in `src/physics`.


## Requirements
Although the app runs entirely in the browser, [*Node.js*](https://nodejs.org/) (v20 or higher) is required for development to start the local server that serves the static files.


## Run locally

1. Install dependencies:
```pwsh
npm install
```

2. Run the project locally (it should automatically open in a browser tab, otherwise, navigate to [`http://localhost:5173`]()).
```pwsh
npm run dev
```

## Licence

View and experiment locally only — redistribution or production use is prohibited. See LICENSE.