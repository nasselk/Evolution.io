import { type ConstructorOptions, defineCustomType } from "./entity";

import { DynamicEntity } from "./dynamicEntity";

import Herbivor from "./herbivore";

import Animal from "./animal";



@defineCustomType("carnivore")

export default class Carnivor extends Animal {
	static override readonly list: Map<number, Animal> = new Map();


	public constructor(options: ConstructorOptions) {
		super({
			size: 40,
			...options
		});

		this.damages = 1;
  	}


	public override dynamicInteraction(entity: DynamicEntity): void {
		super.dynamicInteraction(entity);

		if (entity instanceof Herbivor) {
			this.damage(entity);
		}
	}


	public damage(entity: Herbivor): void {
		entity.health -= this.damages;

		if (entity.health <= 0) {
			entity.destroy();
		}
	}
}