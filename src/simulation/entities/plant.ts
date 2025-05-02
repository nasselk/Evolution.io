import { type ConstructorOptions, defineCustomType, Entity } from "./entity";

import { randomAngle } from "../../utils/math/angle";

import { Vector } from "../../utils/math/vector";

import { Collider } from "../physic/collider";

import { Simulation } from "../core/simulation";

import { Hitboxes } from "../physic/hitboxes";



@defineCustomType("plant")

export default class Plant extends Entity {
	static override readonly list: Map<number, Plant> = new Map();

	public readonly collider: Collider<this>;

	public constructor(options: ConstructorOptions, replications: number = 0) {
		super({
			size: Simulation.instance.spawner.randomInt(50, 150),
			...options
		});

		this.collider = new Collider(Hitboxes.RECTANGLE, this);
		this.angle = randomAngle();

		this.replicate(replications);
  	}

	
	public replicate<T extends number = number>(amount: T = 1 as T): T extends 0 ? void : Plant {
		if (amount > 0) {
			let position: Vector;

			while (!position! || Simulation.instance.map.isOutside(position)) {
				const angle = Simulation.instance.spawner.randomAngle();
				const distance = Simulation.instance.spawner.randomInt(25, 350);

				position = new Vector(angle, distance, true).add(this.position);
			}

			const plant = Entity.create("plant", {
				position,
			}, amount - 1) as Plant;

			return plant as any;
		}

		else {
			return undefined as any;
		}
	}
}