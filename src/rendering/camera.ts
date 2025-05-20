import { interpolate, interpolateAngle } from "../utils/math/interpolation";

import { getBoundingBox } from "../utils/math/global";

import { Vector } from "../utils/math/vector";

import { type Container } from "pixi.js";

import Game from "../game";



class Camera {
	public readonly position: Vector;
	public readonly target: { readonly position: Vector, angle: number, zoom: number };
	private readonly interpolation: typeof Game.settings.interpolation;
	private readonly canvas: HTMLCanvasElement;
	public readonly boundingBox: Vector;
	public syncZoom: boolean;
	public attached: boolean;
	public angle: number;
	public zoom: number;


	public constructor(canvas: HTMLCanvasElement, interpolation: Camera["interpolation"]) {
		this.zoom = 1;
		this.angle = 0;
		this.position = new Vector();
		this.boundingBox = new Vector();
		this.target = { position: this.position.clone, angle: this.angle, zoom: this.zoom };
		this.interpolation = interpolation;
		this.syncZoom = false;
		this.attached = true;
		this.canvas = canvas;
	}


	public update(scale: number, deltaTime: number): this {
		this.position.x = interpolate(this.position.x, this.target.position.x, this.interpolation.camera, deltaTime);
		this.position.y = interpolate(this.position.y, this.target.position.y, this.interpolation.camera, deltaTime);
		this.angle = interpolateAngle(this.angle, this.target.angle, this.interpolation.angle, deltaTime);
		this.zoom = interpolate(this.zoom, this.target.zoom * scale, this.interpolation.zoom, deltaTime);

		this.boundingBox.set(
			getBoundingBox(this.canvas.width, this.canvas.height, this.angle)
		);

		return this;
	}


	public move(x: number, y: number, immediate: boolean = false): this {
		this.target.position.set(x, y);

		if (immediate) {
			this.position.set(this.target.position);
		}

		return this;
	}


	public rotate(angle: number, immediate: boolean = false): this {
		this.target.angle = angle;

		if (immediate) {
			this.angle = this.target.angle;
		}

		return this;
	}


	public transform(...containers: Container[]): this {
		const center = new Vector(
			this.canvas.width / 2,
			this.canvas.height / 2
		);

		for (const container of containers) {
			container.pivot.set(this.position.x, this.position.y);

			container.position.set(center.x, center.y);

			container.scale.set(this.zoom);

			container.rotation = this.angle;
		}

		return this;
	}


	// Transforms a point from world coordinates to local screen coordinates.
	public toLocalPoint(position: Vector): Vector
	public toLocalPoint(x: number, y?: number): Vector
	public toLocalPoint(a: number | Vector, b?: number): Vector {
		const position = a instanceof Vector ? a.clone : new Vector(a, b!);

		position.subtract(this.position).rotate(this.angle);

		return new Vector(
			this.canvas.width / 2 + position.x * this.zoom,
			this.canvas.height / 2 + position.y * this.zoom
		);
	}


	// Transforms a point from local screen coordinates to world coordinates.
	public toGlobalPoint(position: Vector): Vector
	public toGlobalPoint(x: number, y?: number): Vector
	public toGlobalPoint(a: number | Vector, b?: number): Vector {
		const position = a instanceof Vector ? a : new Vector(a, b!);

		const centered = new Vector(
			(position.x - this.canvas.width / 2) / this.zoom,
			(position.y - this.canvas.height / 2) / this.zoom
		);

		return centered.rotate(-this.angle).add(this.position);
	}
}



export { Camera };