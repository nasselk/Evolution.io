import { interpolate } from "../utils/math/interpolation";

import { type Entity } from "./entities/entity";

import { Vector } from "../utils/math/vector";

import { type Container } from "pixi.js";



class Camera {
	public readonly position: Vector;
	public readonly target: { readonly position: Vector, zoom: number, entity?: Entity | null };
	private readonly interpolation: any;
	public syncZoom: boolean;
	public attached: boolean;
	public zoom: number;

	
	public constructor(canvas: HTMLCanvasElement, interpolation: any) {
		this.zoom = 1;
		this.position = new Vector();
		this.target = { position: this.position.clone, zoom: this.zoom };
		this.interpolation = interpolation;
		this.syncZoom = false;
		this.attached = true;

		this.gestures(canvas);
	}


	public gestures(canvas: HTMLCanvasElement): void {
		canvas.addEventListener("wheel", (event) => {
			const delta = event.deltaY / 1000;

			if (this.target.zoom - delta > 0.05) {
				this.target.zoom -= delta;
			}
		});


		canvas.addEventListener("mousemove", (event) => {
			if (event.buttons === 1) {
				this.target.position.x -= event.movementX / this.zoom;
				this.target.position.y -= event.movementY / this.zoom;

				this.attached = false;
			}
		});
	}


	public update(scale: number, deltaTime: number): this {
		if (!this.target.entity) {
			//this.target.position.x += 0.5 * deltaTime;
			//this.target.position.y += 0.5 * deltaTime;
		}

		else if (this.attached) {
			const entity = this.target.entity;

			this.target.position.set(entity.target.position);
		}


		this.position.x = interpolate(this.position.x, this.target.position.x, this.interpolation.camera, deltaTime);
		this.position.y = interpolate(this.position.y, this.target.position.y, this.interpolation.camera, deltaTime);
		this.zoom = interpolate(this.zoom, this.target.zoom * scale, this.interpolation.zoom, deltaTime);

		return this;
	}


	public setPosition(x: number, y: number, immediate: boolean = false): this {
		this.target.position.set(x, y);

		if (immediate) {
			this.position.set(this.target.position);
		}

		return this;
	}


	public transform(canvas: HTMLCanvasElement, ...containers: Container[]): this {
		for (const container of containers) {
			container.position.set(
				canvas.width / 2 - this.position.x * this.zoom,
				canvas.height / 2 - this.position.y * this.zoom
			);

			container.scale.set(this.zoom);
		}

		return this;
	}
}



export { Camera };