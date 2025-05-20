import { autoDetectRenderer, BitmapText, Container, Graphics, Sprite, type Point, type Renderer } from "pixi.js";

import { newContainer } from "./createVisuals";

import { Vector } from "../utils/math/vector";

import { Timer } from "../utils/timers/timer";

import type Stats from "stats.js";

import { Game } from "../game";



const worldContainer = newContainer({ renderGroup: true });



class RenderingLoop {
	public readonly canvas: HTMLCanvasElement;
	public readonly worldContainer: Container;
	private readonly vertices: Graphics;
	private readonly stage: Container;
	public renderVertices: boolean;
	public renderTextures: boolean;
	private readonly game: Game;
	private renderer?: Renderer;
	private lastFrame: number;
	public resolution: number;
	public frames: number;
	public scale: number;
	public stats: {
		frames?: Stats,
		memory?: Stats,
		ms?: Stats,
	};


	public constructor(game: Game, UIContainer: Container) {
		this.canvas = document.querySelector("#canvas")!;
		this.stage = newContainer({ renderGroup: true });
		this.worldContainer = worldContainer;
		this.lastFrame = performance.now();
		this.vertices = new Graphics();
		this.renderVertices = false;
		this.renderTextures = true;
		this.resolution = 1;
		this.game = game;
		this.frames = 0;
		this.stats = {};
		this.scale = 1;


		this.stage.addChild(this.worldContainer, UIContainer, this.vertices);
	}


	public async init(settings: any): Promise<void> {
		this.resolution = settings.resolution ?? 1;


		this.renderer = await autoDetectRenderer({
			powerPreference: "high-performance",
			backgroundColor: settings.backgroundColor ?? "black",
			preference: settings.renderer ?? "webgl",
			antialias: settings.antialiasing ?? true,
			premultipliedAlpha: false,
			canvas: this.canvas,
		});


		// Resize all elements when resizing window
		window.addEventListener("resize", this.resize.bind(this));

		this.resize();

		// Start rendering
		requestAnimationFrame(this.render.bind(this));
	}


	public render(now: number): void {
		this.stats.frames?.begin();
		this.stats.ms?.begin();


		requestAnimationFrame(this.render.bind(this));


		// Run timers registered in "precise" mode
		Timer.runAll(now);


		if (document.hidden) {
			return;
		}
		

		const deltaTime: number = Math.min(100, now - this.lastFrame) / 10;

		this.lastFrame = now;

		this.frames++;


		this.game.camera.update(this.scale, deltaTime);

		this.game.camera.transform(this.worldContainer);


		this.game.map.renderGrid(this.game.camera, 500 / 5, 2, true);
		this.game.map.renderGrid(this.game.camera, 500, 6, false, true);


		for (const entity of this.game.entities.values()) {
			entity.render(deltaTime);
		}

		this.debug(this.worldContainer);

		this.renderer?.render(this.stage);


		this.stats.frames?.end();
		this.stats.ms?.end();
		this.stats.memory?.update();
	}


	private debug(container: Container, scaleX: number = container.scale.x, scaleY: number = container.scale.y, rotation: number = container.rotation, firstContainer: boolean = true, depth: number = 0): void {
		if (firstContainer) {
			if (this.renderVertices || !this.renderTextures) {
				this.vertices.visible = true;
				this.vertices.clear();
			}

			if (!this.renderTextures) {
				this.worldContainer.visible = false;

				this.vertices.rect(0, 0, this.canvas.width, this.canvas.height);
				this.vertices.fill({ color: "black" });
			}

			else {
				this.worldContainer.visible = true;
			}


			if (!this.renderVertices) {
				if (this.renderTextures) {
					this.vertices.visible = false;
				}

				return;
			}
		}

		if (container.visible && container.renderable || (container === this.worldContainer && !this.renderTextures)) {
			// Colors for different depths - add or modify as needed
			const depthColors = [
				"white",      // depth 0
				"#00FFFF",    // depth 1 (cyan)
				"#FFFF00",    // depth 2 (yellow)
				"#FF00FF",    // depth 3 (magenta)
				"#00FF00",    // depth 4 (green)
				"#FF8000",    // depth 5 (orange)
				"#0080FF",    // depth 6 (light blue)
			];


			// Determine color for current depth (cycle if more depths than colors)
			const color = depthColors[depth % depthColors.length];


			for (const children of container.children) {
				if (children.constructor.name === Container.name) {
					this.debug(children, scaleX * children.scale.x, scaleY * children.scale.y, rotation + children.rotation, false, depth + 1);
				}

				else if (children instanceof Sprite || children instanceof BitmapText) {
					let globalPosition: Vector | Point = children.getGlobalPosition();
					globalPosition = new Vector(globalPosition.x, globalPosition.y);

					const globalWidth = children.width * scaleX;
					const globalHeight = children.height * scaleY;

					// Get the four corners of the sprite (with rotation)
					const cornerVertices = [
						new Vector(globalPosition.x - globalWidth * children.anchor.x, globalPosition.y - globalHeight * children.anchor.y).rotate(rotation, globalPosition),
						new Vector(globalPosition.x + globalWidth * (1 - children.anchor.x), globalPosition.y - globalHeight * children.anchor.y).rotate(rotation, globalPosition),
						new Vector(globalPosition.x + globalWidth * (1 - children.anchor.x), globalPosition.y + globalHeight * (1 - children.anchor.y)).rotate(rotation, globalPosition),
						new Vector(globalPosition.x - globalWidth * children.anchor.x, globalPosition.y + globalHeight * (1 - children.anchor.y)).rotate(rotation, globalPosition),
					];

					const draws = [1, 2, 3, 0, 2];


					this.vertices.moveTo(cornerVertices[0].x, cornerVertices[0].y);

					for (const i of draws) {
						this.vertices.lineTo(cornerVertices[i].x, cornerVertices[i].y);
					}

					this.vertices.stroke({ width: 2 * this.game.camera.zoom, color });


					for (const vertex of cornerVertices) {
						this.vertices.circle(vertex.x, vertex.y, 5 * this.game.camera.zoom);
					}

					this.vertices.fill(color);
				}
			}
		}
	}


	public resize(): void {
		// Resize canvas
		this.renderer?.resize(document.documentElement.clientWidth * devicePixelRatio * this.resolution, document.documentElement.clientHeight * devicePixelRatio * this.resolution);


		this.canvas.style.width = `${document.documentElement.clientWidth}px`;
		this.canvas.style.height = `${document.documentElement.clientHeight}px`;


		// Resize the scale
		this.scale = Math.min(this.canvas.width, this.canvas.height) / 1080;

		this.game.UI.render(this.scale, this.canvas);
	}
}



export { RenderingLoop, worldContainer };