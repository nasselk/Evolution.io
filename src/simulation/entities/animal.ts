import { getAngleDistance, randomAngle } from "../../math/angle";

import { Entity, type ConstructorOptions } from "./entity";

import { Vector } from "../../math/vector";

import { Timer } from "../../utils/timers/timer";

import { DynamicEntity } from "./dynamicEntity";

import { Collider } from "../physic/collider";

import { Hitboxes } from "../physic/hitboxes";

import Simulation from "../core/simulation";



const enum AnimalState {
	IDLE,
	HUNTING,
	ESCAPING,
	SEARCHING,
	REPRODUCING
}



export default class Animal<T extends "carnivore" | "herbivore" = any> extends DynamicEntity<T> {
	static override readonly list: Map<number, Animal> = new Map();

	
	public readonly collider: Collider<this>;
	protected energy: number;
	protected damages: number;
	protected timeout?: Timer;
	protected lastBite: number;
	protected biteCooldown: number;
	protected biteRadius: number;
	protected state: AnimalState;
	protected target?: Entity | null;
	private viewDistance: number;


	public constructor(options?: ConstructorOptions) {
		super({
			position: Simulation.spawner.randomPosition(Simulation.map.shape),
			size: Simulation.spawner.randomInt(40, 75),
			...options
		});

		this.state = AnimalState.IDLE;
		this.collider = new Collider(Hitboxes.CIRCLE, this);		
		this.energy = 100;
		this.lastBite = 0;

		
		// Settings :
		this.damages = 5 + (this.size.x / 15) * (Simulation.spawner.random() * 2 + 3);
		
		// Genetic variation for movement speed
		const speedGeneticFactor = 0.7 + Simulation.spawner.random() * 0.6;
		this.moveSpeed = (0.65 / Math.sqrt(this.mass)) * speedGeneticFactor;

		// genetic variation for rotation speed
		const rotationGeneticFactor = 0.8 + Simulation.spawner.random() * 0.4;
		this.rotationSpeed = (0.15 / Math.cbrt(this.mass)) * rotationGeneticFactor;

		this.viewDistance = this.size.x * 7;
		this.biteRadius = Math.PI / 2;
		this.biteCooldown = 1000;


		this.animate();
  	}


	public override update(deltaTime: number): void {
		super.update(deltaTime);

		if (this.energy <= 100 && this.state != AnimalState.SEARCHING && !this.target) {
			this.state = AnimalState.SEARCHING;
		}
	}


	public override staticInteraction = (objects: Parameters<Parameters<typeof Simulation.staticGrid.query>[1]>[0], queryID: number): void | boolean => {
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


	public override dynamicInteraction(entity: DynamicEntity): void {
		super.dynamicInteraction(entity);

		this.findTarget(entity);
	}


	private findTarget(entity: Entity): void {
		const distance = this.position.distanceWith(entity.position);

		if (distance <= this.viewDistance && entity instanceof Animal) {
			if (this.type === "carnivore" && entity.type === "herbivore" && this.state === AnimalState.SEARCHING) {
				const tDistance = this.target?.position.distanceWith(this.position) ?? Infinity;


				if (distance < tDistance) {
					this.target = entity;

					this.state = AnimalState.HUNTING;
				}
			}

			else if (entity.type === "carnivore" && this.type === "herbivore" && entity.state === AnimalState.SEARCHING) {
				const tDistance = entity.target?.position.distanceWith(entity.position) ?? Infinity;

				if (distance < tDistance) {
					entity.target = this;

					entity.state = AnimalState.HUNTING;
				}
			}
		}	
	}


	public animate(): void {
		let timeout = Math.random() * 1000 + 1000;


		if (this.target) {
			if (!this.target.spawned || this.position.distanceWith(this.target.position) > this.viewDistance) {
				this.target = null;

				this.state = AnimalState.IDLE;
			}

			else {
				this.movingDirection = this.position.angleWith(this.target.position) + Math.random() * Math.PI / 5;

				this.targetAngle = this.movingDirection;

				timeout = 100;
			}			
		}

		else {
			this.movingDirection = randomAngle();;

			this.targetAngle = this.movingDirection;
		}

		this.timeout = new Timer(this.animate.bind(this), timeout);
	}


	public bite(entity: Entity): boolean { // Returns wether the entity is dead or not
		const now = performance.now();

		if (this.lastBite + this.biteCooldown / Simulation.loop.speed <= now) {
			const angle = this.position.angleWith(entity.position);

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
		const now = performance.now();

		if (this.lastReproduction + this.reproductionCooldown <= now) {
			// center position between the two animals
			const distance = this.position.distanceWith(pair.position) / 2;

			const angle = this.position.angleWith(pair.position) + Math.PI / 2;

			const position = new Vector(
				Math.cos(angle) * distance,
				Math.sin(angle) * distance,
				true
			).add(this.position);


			Entity.create(this.type as any, {
				position
			});

			this.lastReproduction = now;
		}		
	}
}