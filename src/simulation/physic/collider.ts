import { c2cResolution, c2cDetection } from "./collisions/c2c";

import { DynamicEntity } from "../entities/dynamicEntity";

import { type Entity } from "../entities/entity";

import { Vector } from "../../math/vector";

import { Hitboxes } from "./hitboxes";

class Collider<T extends Entity = Entity> {
	public readonly entity: T;
	public readonly position: Vector;
	public readonly velocity: Vector;
	public readonly size: Vector;
	public forceChecks: boolean;
	public restitution: number;
	private type: Hitboxes;

	public constructor(type: Hitboxes, entity: T, position?: Vector, size?: Vector, restitution: number = 0.5) {
		this.velocity = entity instanceof DynamicEntity ? entity.velocity : Vector.null;
		this.position = position ?? entity.position;
		this.size = size ?? entity.size;
		this.restitution = restitution;
		this.forceChecks = true;
		this.entity = entity;
		this.type = type;
	}

	// Make two colliders interact
	public collide(collider: Collider): boolean {
		if (this.type === Hitboxes.CIRCLE && collider.type === Hitboxes.CIRCLE) {
			return c2cResolution(this, collider);
		}

		throw new Error(`Not implemented collision resolution for ${this.type} and ${collider.type}`);
	}

	// Detect if two colliders intersect
	public intersects(collider: Collider, offset?: number): boolean {
		if (this.type === Hitboxes.CIRCLE && collider.type === Hitboxes.CIRCLE) {
			return c2cDetection(this, collider, offset) != undefined;
		}

		throw new Error(`Not implemented collision detection for ${this.type} and ${collider.type}`);
	}

	public set shape(shape: Hitboxes) {
		this.type = shape;
	}

	public get canInteract(): boolean {
		return true;
	}
}

export { Collider };
