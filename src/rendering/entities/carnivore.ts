import { type BufferReader } from "../../shared/thread/reader";

import { defineCustomType } from "./entity";

import Animal from "./animal";



@defineCustomType("carnivore")

export default class Carnivore extends Animal {
	public static override readonly list = new Map<number, Carnivore>();


	public constructor(id: number, properties: BufferReader) {
		super(id, properties);

		this.init();
	}


	public override async init(): Promise<this> {
		await super.init();

		if (this.spawned && this.sprite) {
			this.sprite.tint = "red";
		}

		return this;
	}
}