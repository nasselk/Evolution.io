import { type MsgReader } from "../../utils/thread/reader";

import { Entity, defineCustomType } from "./entity";

import { getTexture } from "../../loader/texture";

import { newSprite } from "../createVisuals";

import { type Sprite } from "pixi.js";



@defineCustomType("animal")

export default class Player extends Entity {
	public static override readonly list = new Map<number, Player>();

	private sprite?: Sprite;


	public constructor(properties: MsgReader) {
		super(properties);

		this.init();
  	}


	public async init(): Promise<this | void> {
		const texture = await getTexture("player", "webp");

		if (this.spawned) {
			this.sprite = newSprite(texture);

			this.sprite.tint = Math.random() > 0.5 ? "red" : "cyan";

			this.container.addChild(this.sprite);

			this.initiated = true;

			return this;
		}
	}
	

	public override render(deltaTime: number): void {
		const visible = super.render(deltaTime);

		if (visible) {
			this.sprite!.setSize(this.size.x, this.size.y);

			this.container.position.set(this.position.x, this.position.y);

			this.container.rotation = this.angle + Math.PI / 2;
		}
	}
}