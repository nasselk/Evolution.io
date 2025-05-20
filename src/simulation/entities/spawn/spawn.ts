import Simulation from "../../core/simulation";

import { type GameMap } from "../../map";

import { type Spawner } from "./spawner";

import { Entity } from "../entity";



function spawnEntities(spawner: Spawner, config: typeof Simulation.config, map: GameMap): void {
	// Plant
	const spotsThreshold = 0.015;

	const plants = config.entities.plant * Math.pow(map.scale, 2);

	for (let i: number = 0; i < plants * spotsThreshold; i++) {
		const count = Simulation.classes.plant.list.size;
		
		const replications = Math.max(Math.min((1 - spotsThreshold) / spotsThreshold, plants - count) - 1, 0);

		Entity.create("plant", {}, replications);		
	}


	// Animals
	for (let i: number = 0; i < config.entities.herbivore; i++) {
		Entity.create("herbivore");
	}


	for (let i: number = 0; i < config.entities.carnivore; i++) {
		Entity.create("carnivore");
	}
}



export { spawnEntities as spawn };