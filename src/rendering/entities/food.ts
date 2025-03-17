import { newContainer, newSprite } from "../createVisuals";

import { type MsgReader } from "../../utils/thread/reader";

import { Entity, defineCustomType } from "./entity";

import { type Sprite, Texture } from "pixi.js";



@defineCustomType("food")

export default class Food extends Entity {
	public static override readonly list = new Map<number, Food>();
	public static override readonly container = newContainer();

	private sprite?: Sprite;


	public constructor(properties: MsgReader) {
		super(properties);
		
		this.init();
  	}


	public init(): this {
		this.sprite = newSprite(Texture.WHITE, {
			tint: "#00CF44"
		});

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