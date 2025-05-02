import { type ConstructorOptions, defineCustomType } from "./entity";

import { DynamicEntity } from "./dynamicEntity";

import Animal from "./animal";



@defineCustomType("herbivore")

export default class Herbivor extends Animal {
	static override readonly list: Map<number, Animal> = new Map();


	public constructor(options: ConstructorOptions) {
		super({
			size: 40,
			...options
		});
	}


	public override dynamicInteraction(entity: DynamicEntity): void {
		super.dynamicInteraction(entity);
	}
}