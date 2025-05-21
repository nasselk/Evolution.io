import { getAngleDistance, randomAngle } from "../../math/angle";

import { Entity, type ConstructorOptions } from "./entity";

import { Timer } from "../../utils/timers/timer";

import { DynamicEntity } from "./dynamicEntity";

import { Collider } from "../physic/collider";

import { Hitboxes } from "../physic/hitboxes";

import Simulation from "../core/simulation";

import { Vector } from "../../math/vector";
import { getRandomInt } from "../../math/point";



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
	protected viewDistance: number;
	public findTarget?(entity: Entity): void;


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
		

		// genetic variation for rotation speed
		const rotationGeneticFactor = 0.8 + Simulation.spawner.random() * 0.4;
		this.rotationSpeed = (0.15 / Math.cbrt(this.mass)) * rotationGeneticFactor;

		this.viewDistance = this.size.x * 7;
		this.biteRadius = Math.PI / 2;
		this.biteCooldown = 1000;


		this.animate();
  	}


	public override update(deltaTime: number, now: number): void {
		super.update(deltaTime);

		const energyThreshold = this.type === "herbivore" ? 50 : 85;

		if (this.state != AnimalState.ESCAPING && (this.state != AnimalState.HUNTING || this.energy > energyThreshold)) {
			if (this.energy <= energyThreshold) {
				this.state = AnimalState.SEARCHING;
			}

			else if (this.lastReproduction + this.reproductionCooldown <= now && Math.random() < 0.55) {
				this.state = AnimalState.REPRODUCING;
			}
		}

		this.useEnergy(deltaTime);
	}


	private useEnergy(deltaTime: number): void {
		this.energy -= this.moveSpeed * deltaTime * (this.type === "herbivore" ? 0.1 : 0.2);

		if (this.energy <= 0) {
			this.destroy();
		}
	}


	public override dynamicInteraction(entity: DynamicEntity): void {
		const intersects = super.dynamicInteraction(entity) as boolean;

		if (entity instanceof Animal) {
			this.animalInteraction(entity, intersects);
		}
	}


	public animate(): void {
		let timeout = Math.random() * 1000 + 1000;


		if (this.predator) {
			if (!this.predator.spawned || this.position.distanceWith(this.predator.position) > this.viewDistance * 2) {
				this.predator = null;

				this.state = AnimalState.IDLE;
			}

			else {
				this.movingDirection = this.position.angleWith(this.predator.position) + Math.PI + Math.random() * Math.PI / 5;

				this.targetAngle = this.movingDirection;

				timeout = 50 + Math.random() * 250;
			}

		}

		else if (this.target) {
			if (!this.target.spawned || this.position.distanceWith(this.target.position) > this.viewDistance) {
				this.target = null;

				this.state = AnimalState.IDLE;
			}

			else {
				this.movingDirection = this.position.angleWith(this.target.position) + Math.random() * Math.PI / 5;

				this.targetAngle = this.movingDirection;

				timeout = 50 + Math.random() * 250;
			}			
		}

		else {
			this.movingDirection = randomAngle();;

			this.targetAngle = this.movingDirection;
		}


		this.timeout = new Timer(this.animate.bind(this), timeout);
	}


	private animalInteraction(entity: Animal, intersects: boolean): void {
		if (this.type === "carnivore" && entity.type === "herbivore") {
			this.attack(entity, intersects);
		}

		else if (this.type === "herbivore" && entity.type === "carnivore") {
			entity.attack(this, intersects);
		}

		this.findPartener(entity, intersects);
	}


	private findPartener(entity: Animal, intersects: boolean): void {
		if (this.type === entity.type && this.state === AnimalState.REPRODUCING && entity.state === AnimalState.REPRODUCING) {
			this.target = entity;

			if (intersects) {
				this.replicate(entity);
			}
		}
	}

	
	private attack(entity: Animal, intersects: boolean): void {
		const destroyed = this.bite(entity, intersects);

		if (!destroyed) {
			this.findTarget?.(entity);
		}
	}


	public bite(entity: Entity, overlapping: boolean): boolean { // Returns wether the entity is dead or not
		const now = performance.now();

		if (this.lastBite + this.biteCooldown / Simulation.loop.speed <= now) {
			const angle = this.position.angleWith(entity.position);

			const angleDistance = getAngleDistance(this.angle, angle);

			if (overlapping && Math.abs(angleDistance) <= this.biteRadius) {
				if (entity.type === "plant") {
					entity.size.scale(0.8);

					this.energy += 5;
				}

				else if (entity.type === "herbivore") {
					this.energy += 3;
				}

				entity.health -= this.damages;

				this.lastBite = now;

				if (entity.health <= 0) {
					entity.destroy();

					if (entity.type === "herbivore") {
						this.energy += entity.mass;
					}

					return true;
				}

				else {
					entity.biteReaction?.(this);
				}
			}
		}
		
		return false;
	}


	protected isVisible(entity: Entity): boolean {
		const distance = this.position.distanceWith(entity.position);

		const angle = this.position.angleWith(entity.position);

		const angleDistance = getAngleDistance(this.angle, angle);

		return distance <= this.viewDistance && Math.abs(angleDistance) <= this.biteRadius;
	}


	public replicate(pair: Animal): void {
		const now = performance.now();

		if (this.lastReproduction + this.reproductionCooldown <= now && pair.lastReproduction + pair.reproductionCooldown <= now) {
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
			pair.lastReproduction = now;
		}		
	}


	public override destroy(): void {
		super.destroy();

		if (this.type != "herbivore" || this.energy > 0) {
			const percentage = Math.random();

			if (percentage < 0.65) {
				Entity.create("plant", {
					position: this.position.clone,
				}, Math.floor(this.size.x / 40) * getRandomInt(1, 3));
			}
		}
	}
}



export { AnimalState };