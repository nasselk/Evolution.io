import { autoDetectRenderer, Container, Graphics, type Renderer } from "pixi.js";

import { newContainer } from "./createVisuals";

import type Stats from "stats.js";

import { Game } from "../game";



const worldContainer = newContainer({ renderGroup: true });



class RenderingLoop {
	public readonly canvas: HTMLCanvasElement;
	public readonly worldContainer: Container;
	private readonly vertices: Graphics;
	private readonly stage: Container;
	private readonly game: Game;
	private renderer?: Renderer;
	private lastFrame: number;
	public resolution: number;
	public frames: number;
	public scale: number;
	public stats?: Stats;


	public constructor(game: Game, UIContainer: Container) {
		this.canvas = document.querySelector("#canvas")!;
		this.stage = newContainer({ renderGroup: true });
		this.worldContainer = worldContainer;
		this.lastFrame = performance.now();
		this.vertices = new Graphics();
		this.resolution = 1;
		this.game = game;
		this.frames = 0;
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
		this.stats?.begin();

		requestAnimationFrame(this.render.bind(this));


		if (document.hidden) {
			return;
		}
		

		const deltaTime: number = Math.min(100, now - this.lastFrame) / 10;

		this.lastFrame = now;

		this.frames++;


		this.game.camera.update(this.scale, deltaTime);

		this.game.camera.transform(this.canvas, this.worldContainer);


		this.game.map.renderGrid(this.game.camera, this.canvas, 500 / 5, 2, true);
		this.game.map.renderGrid(this.game.camera, this.canvas, 500, 6, false, 75);


		for (const entity of this.game.entities.values()) {
			entity.render(deltaTime);
		}


		this.renderer?.render(this.stage);

		this.stats?.end();
	}


	public resize(): void {
		// Resize canvas
		this.renderer?.resize(document.documentElement.clientWidth * devicePixelRatio * this.resolution, document.documentElement.clientHeight * devicePixelRatio * this.resolution);


		this.canvas.style.width = `${ document.documentElement.clientWidth }px`;
		this.canvas.style.height = `${ document.documentElement.clientHeight }px`;


		// Resize the scale
		this.scale = Math.min(this.canvas.width, this.canvas.height) / 1080;

		this.game.UI.render(this.scale, this.canvas);
	}
}



export { RenderingLoop, worldContainer };