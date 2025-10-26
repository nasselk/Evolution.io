import { type ConstructorOptions } from "./entity";

import Simulation from "../core/simulation";

import Animal, { AnimalState } from "./animal";

export default class Carnivore extends Animal<"carnivore"> {
	static override readonly list: Map<number, Animal> = new Map();

	public constructor(options?: ConstructorOptions) {
		super({
			position: Simulation.spawner.randomPosition(Simulation.map.biomes.carnivores),
			...options,
		});

		// Genetic variation for movement speed
		const speedGeneticFactor = 0.7 + Simulation.spawner.random() * 0.6;
		this.moveSpeed = (0.65 / Math.sqrt(this.mass)) * speedGeneticFactor;
	}

	public override staticInteraction(objects: Parameters<Parameters<typeof Simulation.staticGrid.query>[1]>[0], queryID: number): void | boolean {
		for (const plant of objects.plant) {
			if (plant.queryID != queryID) {
				this.collider.collide(plant.collider);

				plant.queryID = queryID;
			}
		}
	}

	public override findTarget(entity: Animal): void {
		if (this.state === AnimalState.SEARCHING || this.state === AnimalState.HUNTING) {
			const distance = this.position.distanceWith(entity.position);

			if (distance <= this.viewDistance) {
				const targetDistance = this.target?.position.distanceWith(this.position) ?? Infinity;

				const switchProbability = Math.random();

				if (distance < targetDistance && switchProbability < 0.25) {
					this.target = entity;

					this.state = AnimalState.HUNTING;
				}
			}
		}
	}
}
