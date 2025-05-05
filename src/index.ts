import UI from "./UI/App.svelte";

import { mount } from "svelte";

import { game } from "./game";

//import "./UI/interaction";


mount(UI, {
	target: document.querySelector<HTMLDivElement>("#app")!
});


if (game.config.ENV === "development") {
	const module = await import("stats.js");

	const Stats = module.default;

	game.renderer.stats.frames = new Stats();

	game.renderer.stats.ms = new Stats();
	game.renderer.stats.ms.showPanel(1);

	game.renderer.stats.memory = new Stats();
	game.renderer.stats.memory.showPanel(2);


	document.body.appendChild(game.renderer.stats.frames.dom);
	document.body.appendChild(game.renderer.stats.memory.dom);
	document.body.appendChild(game.renderer.stats.ms.dom);

	game.renderer.stats.ms.dom.style.left = "80px";
	game.renderer.stats.memory.dom.style.left = "160px";
}