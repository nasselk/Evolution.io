import { c2cResolution, c2cDetection } from "./collisions/c2c";

import { c2rResolution, c2rDetection } from "./collisions/c2r";

import { r2rResolution, r2rDetection } from "./collisions/r2r";

import { DynamicEntity } from "../entities/dynamicEntity";

import { Vector } from "../../utils/math/vector";

import { Entity } from "../entities/entity";

import { Hitboxes } from "./hitboxes";



class Collider<T extends Entity = Entity> {
	public readonly entity: T;
	public readonly position: Vector;
	public readonly velocity: Vector;
	private readonly type: Hitboxes;
	public readonly size: Vector;
	public forceChecks: boolean;
	public restitution: number;


	public constructor(type: Hitboxes, entity: T, position?: Vector, size?: Vector, restitution: number = 0.5) {
		this.velocity = entity instanceof DynamicEntity ? entity.velocity : Vector.null;
		this.position = position ?? entity.position;
		this.size = size ?? entity.size;
		this.restitution = restitution;
		this.forceChecks = true;
		this.entity = entity;
		this.type = type;
	}


	public collide(collider: Collider): boolean {
		if (this.type === Hitboxes.CIRCLE && collider.type === Hitboxes.CIRCLE) {
			return c2cResolution(this, collider);
		}

		else if (this.type === Hitboxes.CIRCLE && collider.type === Hitboxes.RECTANGLE) {
			return c2rResolution(this, collider);
		}

		else if (this.type === Hitboxes.RECTANGLE && collider.type === Hitboxes.CIRCLE) {
			return c2rResolution(collider, this);
		}

		else if (this.type === Hitboxes.RECTANGLE && collider.type === Hitboxes.RECTANGLE) {
			return r2rResolution(this, collider);
		}

		throw new Error(`Not implemented collision resolution for ${ this.type } and ${ collider.type }`);
	}


	public overlaps(collider: Collider, offset?: number): boolean {
		if (this.type === Hitboxes.CIRCLE && collider.type === Hitboxes.CIRCLE) {
			return c2cDetection(this, collider, offset) != undefined;
		}

		else if (this.type === Hitboxes.CIRCLE && collider.type === Hitboxes.RECTANGLE) {
			return c2rDetection(this, collider, offset) != undefined;
		}

		else if (this.type === Hitboxes.RECTANGLE && collider.type === Hitboxes.RECTANGLE) {
			return r2rDetection(this, collider, offset) != undefined;
		}

		else if (this.type === Hitboxes.RECTANGLE && collider.type === Hitboxes.CIRCLE) {
			return c2rDetection(collider, this, offset) != undefined;
		}

		throw new Error(`Not implemented collision detection for ${ this.type } and ${ collider.type }`);
	}
}



export { Collider };