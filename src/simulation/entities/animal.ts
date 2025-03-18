import { type ConstructorOptions, defineCustomType } from "./entity";

import { randomAngle } from "../../utils/math/angle";

import { Timeout } from "../../utils/timers/timeout";

import { DynamicEntity } from "./dynamicEntity";

import { Collider } from "../physic/collider";



@defineCustomType("animal")

export default class Animal extends DynamicEntity {
	static override readonly list: Map<number, Animal> = new Map();

	
	public readonly collider: Collider<this>;
	protected damages: number;
	protected timeout?: Timeout;


	public constructor(options: ConstructorOptions) {
		super({
			size: 40,
			...options
		});

		this.collider = new Collider("CIRCLE", this);
		this.damages = Math.random() * 10 + 10;
		this.rotationSpeed = 0.085;

		this.animate();
  	}


	public animate(): void {
		const angle = randomAngle();

		this.movingDirection = angle;

		this.targetAngle = angle;

		this.timeout = new Timeout(this.animate.bind(this), Math.random() * 1000 + 1000, true);
	}
}