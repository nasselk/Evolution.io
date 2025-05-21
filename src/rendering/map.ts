import { Container, type Graphics } from "pixi.js";

import { newGraphics } from "./createVisuals";

import { type Camera } from "./core/camera";

import { Polygon } from "../math/polygon";

import { Vector } from "../math/vector";

import map from "../map.json";



class GameMap {
	private static readonly offset: number = map.offset; // Offset to avoid uint16 overflow


	public readonly bounds: { min: Vector, max: Vector };
	public readonly biomes: Record<keyof typeof map.biomes, Biome>;
	public readonly colors: typeof map.colors;
	public readonly grid: Graphics;
	private readonly scale: number;
	public readonly shape: Polygon;


	public constructor(container: Container) {
		this.scale = map.scale;
		this.biomes = this.generateBiomes(map.biomes);
		this.shape = this.generateShape();
		this.colors = map.colors;
		this.grid = newGraphics();
		this.bounds = {
			min: new Vector(GameMap.offset, GameMap.offset),
			max: new Vector(GameMap.offset, GameMap.offset)
		};

		this.init();

		container.addChild(this.grid);
	}


	private generateBiomes(data: any): this["biomes"] {
		const biomes = {} as this["biomes"];

		// Biomes
		for (const [name, biome] of Object.entries(data) as any) {
			if (biome.width && biome.height) {
				const shape = new Polygon(biome.x ?? biome.width / 2, biome.y ?? biome.height / 2, biome.width, biome.height, GameMap.offset, this.scale);

				biomes[name as keyof typeof map.biomes] = new Biome(name as keyof typeof map.biomes, shape, biome.color);
			}

			else {
				const shape = new Polygon(biome.shape, GameMap.offset, this.scale);

				biomes[name as keyof typeof map.biomes] = new Biome(name as keyof typeof map.biomes, shape, biome.color);
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



	public getBiome(entity: any): Biome | void {
		for (const biome of Object.values(this.biomes)) {
			if (biome.intersects(entity.position)) {
				return biome;
			}
		}
	}
	

	public renderGrid(camera: Camera, cellSize: number, thickness: number, clear: boolean = false, crosses: boolean = false, color: string = "A4A4A4"): void {
		if (clear) {
			this.grid.clear();
		}


		let alpha = 1;

		const thicknessZoomed = thickness * camera.zoom;

		if (thicknessZoomed < 2) {
			alpha = (thicknessZoomed / 2) * 0.9;
		}


		const crossSize = crosses ? thickness * 12.5 : 0;

		const viewWidth = camera.boundingBox.x / camera.zoom;
		const viewHeight = camera.boundingBox.y / camera.zoom;

		// Expand the view dimensions by the stroke width
		const extendedWidth = viewWidth + thickness / 2 + crossSize / 2;
		const extendedHeight = viewHeight + thickness / 2 + crossSize / 2;

		// World coordinates for the top-left of the view (shifted to include margin)
		const worldX = camera.position.x - viewWidth / 2 - thickness / 2 - crossSize / 2;
		const worldY = camera.position.y - viewHeight / 2 - thickness / 2 - crossSize / 2;


		// Compute offsets so grid lines align with multiples of cellSize
		let offsetX = worldX % cellSize;
		let offsetY = worldY % cellSize;
		if (offsetX > 0) offsetX -= cellSize;
		if (offsetY > 0) offsetY -= cellSize;

		const nbCellX = Math.floor((extendedWidth - offsetX) / cellSize);
		const nbCellY = Math.floor((extendedHeight - offsetY) / cellSize);


		if (alpha > 0.2) {
			// Draw vertical lines
			for (let i = 0; i <= nbCellX; i++) {
				const x = worldX - offsetX + i * cellSize;
				this.grid.moveTo(x, worldY);
				this.grid.lineTo(x, worldY + extendedHeight);
			}

			// Draw horizontal lines
			for (let i = 0; i <= nbCellY; i++) {
				const y = worldY - offsetY + i * cellSize;
				this.grid.moveTo(worldX, y);
				this.grid.lineTo(worldX + extendedWidth, y);
			}


			this.grid.stroke({ width: thickness, color: color, alpha: alpha });
		}


		// Draw crosses
		if (crosses) {
			for (let i = 0; i <= nbCellX; i++) {
				for (let j = 0; j <= nbCellY; j++) {
					const x = worldX - offsetX + i * cellSize;
					const y = worldY - offsetY + j * cellSize;

					// Horizontal line of the cross
					this.grid.moveTo(x - crossSize / 2, y);
					this.grid.lineTo(x + crossSize / 2, y);

					// Vertical line of the cross
					this.grid.moveTo(x, y - crossSize / 2);
					this.grid.lineTo(x, y + crossSize / 2);
				}
			}


			this.grid.stroke({ width: thickness * 2.25, color: color });
		}
	}
}



class Biome extends Polygon {
	private static index = 0;

	public readonly name: keyof typeof map.biomes;
	public readonly encoder: number;
	public readonly color: string;

	constructor(name: keyof typeof map.biomes, shape: Polygon, color: string) {
		super(shape.points);

		this.encoder = Biome.index++;
		this.color = color;
		this.name = name;
	}
}



export { GameMap, type Biome };