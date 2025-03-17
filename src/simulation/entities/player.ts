import { type ConstructorOptions, defineCustomType } from "./entity";

import { DynamicEntity } from "./dynamicEntity";

import { Collider } from "../physic/collider";

//import { game } from "../index";



@defineCustomType("player")

export default class Player extends DynamicEntity {
	static override readonly list: Map<number, Player> = new Map();

	public readonly FOV: { width: number, height: number, zoom: number };
	public override readonly pressedKeys: NonNullable<DynamicEntity["pressedKeys"]>;
	public readonly collider: Collider<this>;
	public socketID: number | null;
	public permissions: number;
	public partyID?: number;

	
	public constructor(options: ConstructorOptions, FOV?: { width: number, height: number, zoom: number }, socketID: number | null = null, permissions: number = 0) {
		super({
			size: 75,
			...options
		});

		this.collider = new Collider("CIRCLE", this);
		this.permissions = permissions;
		this.rotationSpeed = 0.085;
		this.socketID = socketID;
		this.FOV = {
			width: FOV?.width ?? 1920,
			height: FOV?.height ?? 1080,
			zoom: FOV?.zoom ?? 1
		};

		this.pressedKeys = {
			up: false,
			down: false,
			left: false,
			right: false,
		};
  	}


	public override destroy(): void {
		if (this.socketID) {
			game.socketThread.send("removePlayerID", this.socketID);

			game.FOVThread?.send("removeFOV", this.socketID);
		}

		super.destroy();
	}
}