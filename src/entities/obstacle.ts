import { newContainer, newSprite } from "../rendering/createVisuals";

import { type MsgReader } from "../utils/thread/reader";

import { Entity, defineCustomType } from "./entity";

import { type Sprite, Texture } from "pixi.js";



@defineCustomType("obstacle")

export default class Obstacle extends Entity {
	public static override readonly list = new Map<number, Obstacle>();
	public static override readonly container = newContainer();

	private sprite?: Sprite;


	public constructor(properties: MsgReader) {
		super(properties);
		
		this.init();
  	}


	public init(): this {
		this.sprite = newSprite(Texture.WHITE);

		this.container.addChild(this.sprite);

		this.initiated = true;

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