import { type Game } from "../../core/simulation";

import { type GameMap } from "../../map";

import { type Spawner } from "./spawner";

import { Entity } from "../entity";



function spawnEntities(spawner: Spawner, config: Game["config"], map: GameMap): void {
	const random = Math.random.bind(Math);

	
	// Plant
	for (let i: number = 0; i < config.entities.plant * Math.pow(map.scale, 2); i++) {
		const position = spawner.randomPosition(map.shape);

		const size = spawner.randomInt(50, 150);

		Entity.create("plant", {
			position: position,
			creationTick: 1,
			size: size,
		});		
	}



	// Animals
	for (let i: number = 0; i < config.entities.herbivore; i++) {
		const position = spawner.randomPosition(map.shape, 0, random);

		Entity.create("animal", {
			position: position,
			creationTick: 1,
		});
	}


	for (let i: number = 0; i < config.entities.carnivore; i++) {
		const position = spawner.randomPosition(map.shape, 0, random);

		Entity.create("animal", {
			position: position,
			creationTick: 1,
		});
	}
}



export { spawnEntities as spawn };