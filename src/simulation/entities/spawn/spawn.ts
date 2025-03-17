import { type Game } from "../../core/simulation";

import { type GameMap } from "../../map";

import { type Spawner } from "./spawner";

import { Entity } from "../entity";



function spawnEntities(spawner: Spawner, config: Game["config"], map: GameMap): void {
	const random = Math.random.bind(Math);

	
	// Food
	for (let i: number = 0; i < config.entities.food * Math.pow(map.scale, 2); i++) {
		const position = spawner.randomPosition(map.shape);

		const size = spawner.randomInt(50, 150);

		Entity.create("food", {
			position: position,
			size: size,
		});		
	}


	// Animals
	for (let i: number = 0; i < config.entities.prey; i++) {
		const position = spawner.randomPosition(map.shape, 0, random);

		Entity.create("animal", {
			position: position,
		});
	}


	for (let i: number = 0; i < config.entities.predator; i++) {
		const position = spawner.randomPosition(map.shape, 0, random);

		Entity.create("animal", {
			position: position,
		});
	}
}



export { spawnEntities as spawn };