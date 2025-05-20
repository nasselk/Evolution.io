import { type ConstructorOptions } from "./entity";

import Animal from "./animal";



export default class Herbivor extends Animal<"herbivore"> {
	static override readonly list: Map<number, Animal> = new Map();


	public constructor(options?: ConstructorOptions) {
		super(options);
	}
}