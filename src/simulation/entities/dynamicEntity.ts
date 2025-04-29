import { type ConstructorOptions, Entity } from "./entity";

import { normalizeAngle } from "../../utils/math/angle";

import { BufferWriter } from "../../shared/thread/writer";

import { Vector } from "../../utils/math/vector";

import { type GameMap } from "../map";



abstract class DynamicEntity extends Entity {
	protected readonly forces: Set<Vector>;
	public readonly velocity: Vector;
	protected override readonly observable: Entity["observable"] & { position: Vector, angle: number };
	public angularVelocity: number;
	public targetAngle?: number;
	protected moveSpeed: number;
	protected friction: number;
	protected moving: boolean;
	protected angularFriction: number;
	protected rotationSpeed?: number;
	protected movingDirection?: number | null;


	public constructor(options: ConstructorOptions) {
		super(options);

		this.velocity = new Vector();
		this.moving = false;
		this.angularVelocity = 0;
		this.moveSpeed = 0.15;
		this.friction = 0.965;
		this.forces = new Set();
		this.angularFriction = 0.775;
		this.mass = options.mass || 1; // Should be >= 1
		this.targetAngle = this.movingDirection = this.angle;
		this.observable = { health: this.health, size: this.size, position: this.position.clone, angle: this.angle};
	}


	public update(deltaTime: number, map: GameMap): void {
		this.storeProperties();

		this.move(deltaTime);

		this.rotate(deltaTime);

		map.constrain(this.position);

		this.collider.forceChecks = false;
	}


	protected override storeProperties(): void {
		super.storeProperties();

		this.observable.position.set(this.position);
		this.observable.angle = this.angle;
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


		this.collider.forceChecks = this.isMoving("strict");


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


	private isMoving(type: "strict" | "strictX" | "strictY" | "velocity" = "velocity", acceptedDelta: number = 0.0025): boolean {
		switch (type) {
			case "strict":
				return this.position.distanceWith(this.observable.position) > acceptedDelta;

			case "strictX":
				return Math.abs(this.position.x - this.observable.position.x) > acceptedDelta;

			case "strictY":
				return Math.abs(this.position.y - this.observable.position.y) > acceptedDelta;

			case "velocity":
				return Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2) > acceptedDelta;

			default:
				throw new Error("Invalid type");
		}
	}


	public packUpdates(writer?: BufferWriter, additionalBytes: number = 0): BufferWriter {
		const buffer = writer ?? new BufferWriter(10 + additionalBytes);

		buffer.writeUint16(this.id);

		const x = BufferWriter.toPrecision(this.position.x, this.constructor.game.map.bounds.max.x, 16);
		const y = BufferWriter.toPrecision(this.position.y, this.constructor.game.map.bounds.max.y, 16);

		buffer.writeUint16(x);
		buffer.writeUint16(y);

		buffer.writeFloat32(this.angle);

		return buffer;
	}
}



export { DynamicEntity };