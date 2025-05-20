import { type ConstructorOptions } from "./entity";

import { type DynamicEntity } from "./dynamicEntity";

import Herbivor from "./herbivore";

import Animal from "./animal";



export default class Carnivor extends Animal<"carnivore"> {
	static override readonly list: Map<number, Animal> = new Map();


	public constructor(options?: ConstructorOptions) {
		super(options);
  	}


	public override dynamicInteraction(entity: DynamicEntity): void {
		super.dynamicInteraction(entity);

		if (entity instanceof Herbivor) {
			this.bite(entity);
		}
	}
}