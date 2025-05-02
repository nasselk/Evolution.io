import { type Simulation } from "../../core/simulation";

import { type GameMap } from "../../map";

import { type Spawner } from "./spawner";

import { Entity } from "../entity";



function spawnEntities(spawner: Spawner, config: Simulation["config"], map: GameMap): void {
	const random = Math.random.bind(Math);

	
	// Plant
	const spotsThreshold = 0.0015;

	const plants = config.entities.plant * Math.pow(map.scale, 2);

	for (let i: number = 0; i < plants * spotsThreshold; i++) {
		const position = spawner.randomPosition(map.shape);

		Entity.create("plant", {
			position: position,
		}, (1 - spotsThreshold) / spotsThreshold);		
	}



	// Animals
	for (let i: number = 0; i < config.entities.herbivore; i++) {
		const position = spawner.randomPosition(map.shape, 0, random);

		Entity.create("herbivore", {
			position: position,
		});
	}


	for (let i: number = 0; i < config.entities.carnivore; i++) {
		const position = spawner.randomPosition(map.shape, 0, random);

		Entity.create("carnivore", {
			position: position,
		});
	}
}



export { spawnEntities as spawn };