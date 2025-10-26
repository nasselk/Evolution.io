import { type Sprite } from "pixi.js";

import { Entity } from "./entity";

export default abstract class Animal<T extends "carnivore" | "herbivore" = any> extends Entity<T> {
	public static override readonly list = new Map<number, Animal>();

	protected texture?: Sprite;

	public override render(deltaTime: number): void {
		const visible = super.render(deltaTime);

		if (visible) {
			this.texture!.setSize(this.size.x, this.size.y);

			this.container.position.set(this.position.x, this.position.y);

			this.container.rotation = this.angle + Math.PI / 2;
		}
	}
}
