import { type ConstructorOptions, defineCustomType, Entity } from "./entity";

import { randomAngle } from "../../utils/math/angle";

import { Collider } from "../physic/collider";



@defineCustomType("food")

export default class Food extends Entity {
	static override readonly list: Map<number, Food> = new Map();

	public readonly collider: Collider<this>;

	public constructor(options: ConstructorOptions) {
		super(options);

		this.collider = new Collider("RECTANGLE", this);
		this.angle = randomAngle();
  	}
}