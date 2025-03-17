import { type ConstructorOptions, defineCustomType } from "./entity";

import { randomAngle } from "../../utils/math/angle";

import { Timeout } from "../../utils/timers/timeout";

import Player from "./player";



@defineCustomType("AIPlayer", "player")

export default class AIPlayer extends Player {
	public static override readonly isSubType: boolean = true;
	
	protected timeout?: Timeout;

	public constructor(options: ConstructorOptions) {
		super(options);

		this.movesType = "directional";

		this.animate();
	}

	public animate(): void {
		const angle = randomAngle();

		this.movingDirection = angle;

		this.targetAngle = angle;

		this.timeout = new Timeout(this.animate.bind(this), Math.random() * 1000 + 1000);
	}
}