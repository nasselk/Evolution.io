import UI from "./UI/App.svelte";

import { mount } from "svelte";

import Game from "./game";



void Game.init();


mount(UI, {
	target: document.querySelector<HTMLDivElement>("#app")!
});



if (Game.config.ENV === "development") {
	const module = await import("stats.js");

	const Stats = module.default;

	Game.renderer.stats.frames = new Stats();

	Game.renderer.stats.ms = new Stats();
	Game.renderer.stats.ms.showPanel(1);

	Game.renderer.stats.memory = new Stats();
	Game.renderer.stats.memory.showPanel(2);


	document.body.appendChild(Game.renderer.stats.frames.dom);
	document.body.appendChild(Game.renderer.stats.memory.dom);
	document.body.appendChild(Game.renderer.stats.ms.dom);

	Game.renderer.stats.ms.dom.style.left = "80px";
	Game.renderer.stats.memory.dom.style.left = "160px";
}