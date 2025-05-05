import { type ConstructorOptions, defineCustomType, Entity } from "./entity";

import { interpolate } from "../../utils/math/interpolation";

import { randomAngle } from "../../utils/math/angle";

import { Vector } from "../../utils/math/vector";

import { Simulation } from "../core/simulation";

import { DynamicEntity } from "./dynamicEntity";

import { Collider } from "../physic/collider";

import { Hitboxes } from "../physic/hitboxes";



@defineCustomType("plant")

export default class Plant extends DynamicEntity {
	static override readonly list: Map<number, Plant> = new Map();

	public readonly collider: Collider<this>;
	private readonly root: Vector;

	public constructor(options?: ConstructorOptions, replications: number = 0) {
		super({
			position: Simulation.instance.spawner.randomPosition(Simulation.instance.map.shape),
			size: Simulation.instance.spawner.randomInt(50, 150),
			angle: randomAngle(),
			mass: 1,
			...options
		});

		this.collider = new Collider(Hitboxes.CIRCLE, this);
		this.root = this.position.clone;
		this.movingDirection = null;

		this.replicate(replications);

		Simulation.instance.staticGrid.insert(this);
  	}


	public override update(deltaTime: number): void {
		super.update(deltaTime);

		this.position.x = interpolate(this.position.x, this.root.x, 0.035, deltaTime);
		this.position.y = interpolate(this.position.y, this.root.y, 0.035, deltaTime);

		Simulation.instance.staticGrid.move(this); // Met à jour la grille statique avec la position de la plante
	}
	

	public override destroy(): void {
		Simulation.instance.staticGrid.remove(this); // Supprime la plante de la grille statique

		super.destroy();
	}


	// Fonction pour répliquer (créer) une ou plusieurs nouvelles plantes
	public replicate<T extends number = number>(amount: T = 1 as T): Plant | void {
		if (amount > 0) {
			let position: Vector;

			// Cherche une position valide (à l'intérieur de la carte)
			while (!position! || Simulation.instance.map.isOutside(position)) {
				const angle = Simulation.instance.spawner.randomAngle(); // Angle aléatoire
				const distance = Simulation.instance.spawner.randomInt(25, 350);// Distance aléatoire entre 25 et 350 unités

				position = new Vector(angle, distance, true).add(this.position);  // Calcule la position autour de la plante actuelle
			}
			
			// Crée une nouvelle plante à la position trouvée
			const plant = Entity.create("plant", {
				position,
			}, amount - 1);

			return plant; // Retourne la nouvelle plante
		}
	}
}