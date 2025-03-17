import { game } from "./game";

import "./UI/interaction";



if (game.config.ENV === "development") {
	const module = await import("stats.js");

	const Stats = module.default;
	game.renderer.stats = new Stats();

	document.body.appendChild(game.renderer.stats.dom);
}