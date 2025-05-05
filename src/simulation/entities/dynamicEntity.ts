import { type ConstructorOptions, Entity } from "./entity";

import { normalizeAngle } from "../../utils/math/angle";

import { Vector } from "../../utils/math/vector";

import { Simulation } from "../core/simulation";



abstract class DynamicEntity extends Entity {
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
	public staticInteraction?: (objects: Parameters<Parameters<typeof Simulation.instance.staticGrid.query>[1]>[0], queryID: number) => void;


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


	public update(deltaTime: number, now?: number): void {
		void now;

		this.move(deltaTime);
		this.rotate(deltaTime);

		if (this.staticInteraction) {
			Simulation.instance.staticGrid.query(this, this.staticInteraction);
		}

		Simulation.instance.map.constrain(this.position);
	}


	public dynamicInteraction(entity: DynamicEntity): void {
		this.collider.collide(entity.collider);
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


		this.angularVelocity /= (1 + this.angularFriction * deltaTime);


		this.angle = normalizeAngle(this.angle + this.angularVelocity * deltaTime);


		return this;
	}
}



export { DynamicEntity };