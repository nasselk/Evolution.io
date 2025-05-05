import { type ConstructorOptions, defineCustomType } from "./entity";

import Animal from "./animal";



@defineCustomType("herbivore")

export default class Herbivor extends Animal {
	static override readonly list: Map<number, Animal> = new Map();


	public constructor(options?: ConstructorOptions) {
		super(options);
	}
}