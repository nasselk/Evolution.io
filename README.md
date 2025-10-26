# Evolution.io

Evolution.io is a simulation project built in TypeScript on top of a lightweight in-house engine (Phoenix.Engine).  
It simulates interactions between carnivores, herbivores and plants on a large procedurally-generated map and produces rich emergent behaviours (hunting, fleeing, reproduction, foraging, territory dynamics). The engine is optimized for performance and can handle very large populations (reported >55k animals on an average machine) while keeping deterministic simulation features and good visual responsiveness.

Key features
- Agent-based ecosystem simulation with emergent behaviour
- Efficient spatial structures and rendering (PixiJS) for large entity counts
- Configurable genetics, movement, combat and reproduction systems
- TypeScript codebase with modular systems for simulation, rendering and UI

How to run

# First
- Run `npm install` to install dependencies and auto build

# For development
- Run `npm run dev` to start the development server.
- Open your browser and navigate to `http://localhost:5173` to see the application in action (it should open itself).

# For production
- Run `npm run build` to build the application for production.
- Run `npm run preview` to start the production server.
- Open your browser and navigate to `http://localhost:4173` to see the application in action (it should open itself).