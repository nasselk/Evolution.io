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
		// Load the texture in async
		const texture = await getTexture("carnivore");

		if (this.spawned) {
			this.texture = newSprite(texture);

			this.container.addChild(this.texture);

			this.initiated = true;
		}

		return this;
	}
}
