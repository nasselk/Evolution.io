import { getAngleDistance, randomAngle } from "../../utils/math/angle";

import { Entity, type ConstructorOptions } from "./entity";

import { Vector } from "../../utils/math/vector";

import { Timer } from "../../utils/timers/timer";

import { DynamicEntity } from "./dynamicEntity";

import { Simulation } from "../core/simulation";

import { Collider } from "../physic/collider";

import { Hitboxes } from "../physic/hitboxes";



export default class Animal extends DynamicEntity {
	static override readonly list: Map<number, Animal> = new Map();

	
	public readonly collider: Collider<this>;
	protected hunger: number;
	protected damages: number;
	protected timeout?: Timer;
	protected lastBite: number;
	protected biteCooldown: number;
	protected biteRadius: number;


	public constructor(options?: ConstructorOptions) {
		super({
			position: Simulation.instance.spawner.randomPosition(Simulation.instance.map.shape),
			size: Simulation.instance.spawner.randomInt(40, 75),
			mass: 5,
			...options
		});

		this.rotationSpeed = 0.085;
		this.collider = new Collider(Hitboxes.CIRCLE, this);
		this.damages = Math.random() * 10 + 10;
		this.biteRadius = Math.PI / 2;
		this.biteCooldown = 1000;
		this.hunger = 100;
		this.lastBite = 0;

		this.animate();
  	}


	public override update(deltaTime: number): void {
		super.update(deltaTime);

	}


	public override staticInteraction = (objects: Parameters<Parameters<typeof Simulation.instance.staticGrid.query>[1]>[0], queryID: number): void | boolean => {
		for (const plant of objects.plant) {
			if (plant.queryID != queryID) {
				const overlapping = this.collider.collide(plant.collider);

				if (overlapping && this.type === "herbivore") {
					this.bite(plant);
				}

				plant.queryID = queryID;
			}
		}
	};


	public animate(): void {
		const angle = randomAngle();

		this.movingDirection = angle;

		this.targetAngle = angle;

		this.timeout = new Timer(this.animate.bind(this), Math.random() * 1000 + 1000, true);
	}


	public bite(entity: Entity): boolean { // Returns wether the entity is dead or not
		const now = performance.now();

		if (this.lastBite + this.biteCooldown <= now) {
			const angle = this.position.angleWith(entity.position) + Math.PI / 2;

			const angleDistance = getAngleDistance(this.angle, angle);

			if (Math.abs(angleDistance) <= this.biteRadius) {
				if (entity.type === "plant") {
					entity.size.scale(0.8);
				}

				entity.health -= this.damages;

				if (entity.health <= 0) {
					entity.destroy();

					return true;
				}

				this.lastBite = now;
			}
		}
		
		return false;
	}


	public replicate(pair: Animal): void {
		// center position between the two animals
		const distance = this.position.distanceWith(pair.position) / 2;

		const angle = this.position.angleWith(pair.position) + Math.PI / 2;

		const position = new Vector(
			Math.cos(angle) * distance,
			Math.sin(angle) * distance,
			true
		).add(this.position);

		Entity.create(this.type, {
			position
		});

		this.lastReproduction = performance.now();
	}
}