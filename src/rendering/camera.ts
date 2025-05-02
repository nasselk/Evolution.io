import { interpolate } from "../utils/math/interpolation";

import { type Entity } from "./entities/entity";

import { Vector } from "../utils/math/vector";

import { type Container } from "pixi.js";



class Camera {
	public readonly position: Vector;
	public readonly target: { readonly position: Vector, zoom: number, entity?: Entity | null };
	private readonly canvas: HTMLCanvasElement;
	private readonly interpolation: any;
	public zoom: number;


	public constructor(canvas: HTMLCanvasElement, interpolation: any) {
		this.zoom = 1;
		this.position = new Vector();
		this.target = { position: this.position.clone, zoom: this.zoom };
		this.interpolation = interpolation;
		this.canvas = canvas;
	}


	public update(scale: number, deltaTime: number): this {
		if (this.target.entity) {
			const entity = this.target.entity;

			this.target.position.set(entity.target.position);
		}

		this.position.x = interpolate(this.position.x, this.target.position.x, this.interpolation.camera, deltaTime);
		this.position.y = interpolate(this.position.y, this.target.position.y, this.interpolation.camera, deltaTime);
		this.zoom = interpolate(this.zoom, this.target.zoom * scale, this.interpolation.zoom, deltaTime);

		return this;
	}


	public move(x: number, y: number, immediate: boolean = false): this {
		this.target.position.set(x, y);

		if (immediate) {
			this.position.set(this.target.position);
		}

		return this;
	}


	public transform(...containers: Container[]): this {
		for (const container of containers) {
			container.position.set(
				this.canvas.width / 2 - this.position.x * this.zoom,
				this.canvas.height / 2 - this.position.y * this.zoom
			);

			container.scale.set(this.zoom);
		}

		return this;
	}


	// Transforms a point from world coordinates to local screen coordinates.
	public toLocalPoint(position: Vector): Vector
	public toLocalPoint(x: number, y: number): Vector
	public toLocalPoint(a: number | Vector, b?: number): Vector {
		if (a instanceof Vector) {
			return new Vector(
				this.canvas.width / 2 + (a.x - this.position.x) * this.zoom,
				this.canvas.height / 2 + (a.y - this.position.y) * this.zoom
			);
		}
		else {
			return new Vector(
				this.canvas.width / 2 + (a - this.position.x) * this.zoom,
				this.canvas.height / 2 + (b! - this.position.y) * this.zoom
			);
		}
	}


	// Transforms a point from local screen coordinates to world coordinates.
	public toGlobalPoint(position: Vector): Vector
	public toGlobalPoint(x: number, y: number): Vector
	public toGlobalPoint(a: number | Vector, b?: number): Vector {
		if (a instanceof Vector) {
			return new Vector(
				this.position.x + (a.x - this.canvas.width / 2) / this.zoom,
				this.position.y + (a.y - this.canvas.height / 2) / this.zoom
			);
		}

		else {
			return new Vector(
				this.position.x + (a - this.canvas.width / 2) / this.zoom,
				this.position.y + (b! - this.canvas.height / 2) / this.zoom
			);
		}
	}
}



export { Camera };