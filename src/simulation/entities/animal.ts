import { randomAngle } from "../../utils/math/angle";

import { type ConstructorOptions } from "./entity";

import { Timer } from "../../utils/timers/timer";

import { DynamicEntity } from "./dynamicEntity";

import { Collider } from "../physic/collider";

import { Hitboxes } from "../physic/hitboxes";



export default class Animal extends DynamicEntity {
	static override readonly list: Map<number, Animal> = new Map();

	
	public readonly collider: Collider<this>;
	protected damages: number;
	protected timeout?: Timer;


	public constructor(options: ConstructorOptions) {
		super({
			size: 40,
			...options
		});

		this.collider = new Collider(Hitboxes.CIRCLE, this);
		this.damages = Math.random() * 10 + 10;
		this.rotationSpeed = 0.085;

		this.animate();
  	}


	public animate(): void {
		const angle = randomAngle();

		this.movingDirection = angle;

		this.targetAngle = angle;

		this.timeout = new Timer(this.animate.bind(this), Math.random() * 1000 + 1000, true);
	}


	public override dynamicInteraction(entity: DynamicEntity): void {
		super.dynamicInteraction(entity);
	}
}