import UI from "./UI/App.svelte";

import { mount } from "svelte";

import Game from "./game";

void Game.init(); // Initialize the gameS

// Mount the Svelte app
mount(UI, {
	target: document.querySelector<HTMLDivElement>("#app")!,
});
