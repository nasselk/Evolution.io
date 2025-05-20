import { type BufferReader } from "../../shared/thread/reader";

import { getTexture } from "../../loader/texture";

import { newSprite } from "../createVisuals";

import Animal from "./animal";



export default class Carnivore extends Animal<"carnivore"> {
	public static override readonly list = new Map<number, Carnivore>();


	public constructor(id: number, properties: BufferReader) {
		super(id, properties);

		this.init();
	}


	public override async init(): Promise<this> {
		const texture = await getTexture("carnivore", "png");

		if (this.spawned) {
			this.sprite = newSprite(texture);

			this.container.addChild(this.sprite);

			this.initiated = true;
		}

		return this;
	}
}