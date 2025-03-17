import { type Game } from "../../core/simulation";

import { type GameMap } from "../../map";

import { type Spawner } from "./spawner";

import { Entity } from "../entity";



function spawnEntities(spawner: Spawner, config: Game["config"], map: GameMap): void {
	const random = Math.random.bind(Math);

	
	// Obstacles
	for (let i: number = 0; i < config.entities.obstacles * Math.pow(map.scale, 2); i++) {
		const position = spawner.randomPosition(map.shape);

		const size = spawner.randomInt(75, 250);

		Entity.create("obstacle", {
			position: position,
			size: size,
		});		
	}


	// Bots
	for (let i: number = 0; i < config.entities.bots; i++) {
		const position = spawner.randomPosition(map.shape, 0, random);

		Entity.create("AIPlayer", {
			position: position,
		});
	}
}



export { spawnEntities as spawn };