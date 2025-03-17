import { type ConstructorOptions, defineCustomType } from "./entity";

import { randomAngle } from "../../utils/math/angle";

import { DynamicEntity } from "./dynamicEntity";

import { Collider } from "../physic/collider";



@defineCustomType("obstacle")

export default class Obstacle extends DynamicEntity {
	static override readonly list: Map<number, Obstacle> = new Map();

	public readonly collider: Collider<this>;

	public constructor(options: ConstructorOptions) {
		super(options);

		this.collider = new Collider("RECTANGLE", this, this.position, this.size, 1);
		this.angle = randomAngle();
  	}
}