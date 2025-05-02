import { type BufferReader } from "../../shared/thread/reader";

import { getTexture } from "../../loader/texture";

import { newSprite } from "../createVisuals";

import { defineCustomType } from "./entity";

import Animal from "./animal";



@defineCustomType("herbivore")

export default class Herbivore extends Animal {
	public static override readonly list = new Map<number, Herbivore>();


	public constructor(properties: BufferReader) {
		super(properties);

		this.init();
  	}


	public override async init(): Promise<this> {
		const texture = await getTexture("player", "webp");

		if (this.spawned) {
			this.sprite = newSprite(texture);

			this.sprite.tint = "cyan";

			this.container.addChild(this.sprite);

			this.initiated = true;
		}

		return this;
	}
}