import { type BufferReader } from "../../shared/thread/reader";

import { defineCustomType } from "./entity";

import Animal from "./animal";



@defineCustomType("herbivore")

export default class Herbivore extends Animal {
	public static override readonly list = new Map<number, Herbivore>();


	public constructor(id: number, properties: BufferReader) {
		super(id, properties);

		this.init();
  	}


	public override async init(): Promise<this> {
		await super.init();

		if (this.spawned && this.sprite) {
			this.sprite.tint = "cyan";
		}

		return this;
	}
}