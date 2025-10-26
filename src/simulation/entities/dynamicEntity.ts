import { type ConstructorOptions, Entity, EntityTypes } from "./entity";

import { normalizeAngle } from "../../math/angle";

import { Vector } from "../../math/vector";

import Simulation from "../core/simulation";

abstract class DynamicEntity<T extends EntityTypes = EntityTypes> extends Entity<T> {
	protected readonly forces: Set<Vector>;
	public readonly velocity: Vector;
	public angularVelocity: number;
	public targetAngle?: number;
	protected moveSpeed: number;
	protected friction: number;
	protected moving: boolean;
	protected angularFriction: number;
	protected rotationSpeed?: number;
	protected movingDirection?: number | null;

	public constructor(options?: ConstructorOptions) {
		super(options);

		this.velocity = new Vector();
		this.moving = false;
		this.angularVelocity = 0;
		this.moveSpeed = 0.15;
		this.friction = 0.965;
		this.forces = new Set();
		this.angularFriction = 0.775;
		this.targetAngle = this.movingDirection = this.angle;
		this.mass = options?.mass || Math.pow(this.size.x, 2) * 0.01; // Should be >= 1
	}

	public override update(deltaTime: number, now?: number): void {
		super.update(deltaTime, now);

		this.move(deltaTime);
		this.rotate(deltaTime);

		Simulation.map.constrain(this.position);

		if (this.type != "plant") {
			Simulation.dynamicGrid.insert(this);
		}
	}

	public dynamicInteraction(entity: DynamicEntity): boolean | void {
		const intersects = this.collider.collide(entity.collider);

		return intersects;
	}

	protected move(deltaTime: number): this {
		// Add velocity in the moving direction (entity default movements)
		if (typeof this.movingDirection === "number") {
			const x = Math.cos(this.movingDirection) * this.moveSpeed;
			const y = Math.sin(this.movingDirection) * this.moveSpeed;

			const vector = new Vector(x, y);

			vector.scale(deltaTime);

			this.velocity.add(vector);
		}

		// Add velocity from stored vectors (some forces applied to it)
		for (const vector of this.forces) {
			vector.scale(deltaTime);

			this.velocity.add(vector);
		}

		// Apply friction
		this.velocity.scale(this.friction ** deltaTime);

		// Update position based on velocity
		this.position.add(this.velocity, deltaTime);

		return this;
	}

	protected rotate(deltaTime: number): this {
		if (typeof this.rotationSpeed === "number" && typeof this.targetAngle === "number") {
			let delta: number = this.targetAngle - this.angle;

			// Normalize the angle difference to be between -PI and PI
			while (delta > Math.PI) {
				delta -= 2 * Math.PI;
			}

			while (delta < -Math.PI) {
				delta += 2 * Math.PI;
			}

			this.angularVelocity += delta * this.rotationSpeed * deltaTime;
		}

		this.angularVelocity /= 1 + this.angularFriction * deltaTime;

		this.angle = normalizeAngle(this.angle + this.angularVelocity * deltaTime);

		return this;
	}
}

export { DynamicEntity };
