import { type BufferReader } from "../../shared/thread/reader";

import { getTexture } from "../../loader/texture";

import { newSprite } from "../createVisuals";

import { type Sprite } from "pixi.js";

import { Entity } from "./entity";



export default class Animal extends Entity {
	public static override readonly list = new Map<number, Animal>();

	protected sprite?: Sprite;


	public constructor(id: number, properties: BufferReader) {
		super(id, properties);
  	}


	public async init(): Promise<this> {
		const texture = await getTexture("player", "webp");

		if (this.spawned) {
			this.sprite = newSprite(texture);

			this.container.addChild(this.sprite);

			this.initiated = true;
		}

		return this;
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