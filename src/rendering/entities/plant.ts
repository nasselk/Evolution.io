import { type BufferReader } from "../../shared/thread/reader";

import { newContainer, newSprite } from "../createVisuals";

import { Entity, defineCustomType } from "./entity";

import { getTexture } from "../../loader/texture";

import { type Sprite } from "pixi.js";



@defineCustomType("plant")

export default class Plant extends Entity {
	public static override readonly list = new Map<number, Plant>();
	public static override readonly container = newContainer();

	private sprite?: Sprite;


	public constructor(properties: BufferReader) {
		super(properties);
		
		this.init();
  	}


	public async init(): Promise<this> {
		const texture = await getTexture("plant", "png");

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
			
			this.container.rotation = this.angle;
		}
	}
}