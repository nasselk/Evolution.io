import { type Entity } from "./entities/entity";

import { Polygon } from "../utils/math/polygon";

import { Vector } from "../utils/math/vector";

import map from "../map.json";



class GameMap {
	private static readonly offset: number = map.offset; // 500 offset to avoid uint16 overflow

	public readonly bounds: { min: Vector, max: Vector };
	public readonly biomes: Record<keyof typeof map.biomes, Biome>;
	public readonly shape: Polygon;
	public readonly scale: number;

	
	public constructor() {
		this.scale = map.scale;
		this.biomes = this.generateBiomes(map.biomes);
		this.shape = this.generateShape();
		this.bounds = {
			min: new Vector(GameMap.offset, GameMap.offset),
			max: new Vector(GameMap.offset, GameMap.offset)
		};

		this.init();
	}


	private generateBiomes(data: any): this["biomes"] {
		const biomes = {} as this["biomes"];

		// Biomes
		for (const [ name, biome ] of Object.entries(data) as any) {
			if (biome.width && biome.height) {
				const shape = new Polygon(biome.x ?? biome.width / 2, biome.y ?? biome.height / 2, biome.width, biome.height, GameMap.offset, this.scale);

				biomes[name as keyof typeof map.biomes] = new Biome(name as keyof typeof map.biomes, shape);
			}

			else {
				const shape = new Polygon(biome.shape, GameMap.offset, this.scale);

				biomes[name as keyof typeof map.biomes] = new Biome(name as keyof typeof map.biomes, shape);
			}
		}

		return biomes;
	}


	private generateShape(): Polygon {
		return Polygon.union(...Object.values(this.biomes));
	}


	private init(): void {
		// Bounds
		for (const point of this.shape) {
			if (point.x > this.bounds.max.x) {
				this.bounds.max.x = point.x;
			}

			else if (point.x < this.bounds.min.x) {
				this.bounds.min.x = point.x;
			}


			if (point.y > this.bounds.max.y) {
				this.bounds.max.y = point.y;
			}

			else if (point.y < this.bounds.min.y) {
				this.bounds.min.y = point.y;
			}
		}
	}


	public constrain(position: Vector): void {
		if (position.x < this.bounds.min.x) {
			position.x = this.bounds.min.x;
		}

		else if (position.x > this.bounds.max.x) {
			position.x = this.bounds.max.x;
		}


		if (position.y < this.bounds.min.y) {
			position.y = this.bounds.min.y;
		}

		else if (position.y > this.bounds.max.y) {
			position.y = this.bounds.max.y;
		}
	}


	public getBiome(entity: Entity): Biome | void {
		for (const biome of Object.values(this.biomes)) {
			if (biome.intersects(entity.position)) {
				return biome;
			}
		}
	}
}



class Biome extends Polygon {
	private static index = 0;

	public readonly name: keyof typeof map.biomes;
	public readonly encoder: number;

	constructor(name: keyof typeof map.biomes, shape: Polygon) {
		super(shape.points);

		this.encoder = Biome.index++;
		this.name = name;
	}
}



export { GameMap, type Biome };