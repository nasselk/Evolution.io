import { type ConstructorOptions, defineCustomType, Entity } from "./entity";

import { randomAngle } from "../../utils/math/angle";

import { Collider } from "../physic/collider";

import { Hitboxes } from "../physic/hitboxes";



@defineCustomType("plant")

export default class Plant extends Entity {
	static override readonly list: Map<number, Plant> = new Map();

	public readonly collider: Collider<this>;

	public constructor(options: ConstructorOptions) {
		super(options);

		this.collider = new Collider(Hitboxes.RECTANGLE, this);
		this.angle = randomAngle();
  	}
}