import { SharedBuffer } from "./shared/thread/sharedBuffer";

import Simulation from "./simulation/index?worker&inline";

import * as classes from "./rendering/entities/manager";

import { Entity } from "./rendering/entities/entity";

import { RenderingLoop } from "./rendering/renderer";

import { getTypeDecoder } from "./shared/connector";

import { getRandomInt } from "./utils/math/point";

import { Thread } from "./shared/thread/thread";

import { credit, log } from "./utils/logger";

import { loadAssets } from "./loader/global";

import { Timer } from "./utils/timers/timer";

import { Camera } from "./rendering/camera";

import { IDAllocator } from "./utils/getID";

import settings from "./settings.json";

import updates from "./shared/updates";

import { GameUI } from "./UI/gameUI";

import { isMobile } from "pixi.js";

import config from "./config.json";

import { GameMap } from "./map";



class Game {
	public readonly camera: Camera;
	public readonly config: typeof config;
	public readonly classes: typeof classes;
	public readonly settings: typeof settings;
	public readonly entities: typeof Entity.list;
	public readonly IDAllocator: IDAllocator;
	public readonly renderer: RenderingLoop;
	public sharedBuffer?: SharedBuffer;
	public readonly isMobile: boolean;
	public readonly map: GameMap;
	public readonly UI: GameUI;
	private simulation?: Thread;


	public constructor() {
		this.classes = classes;
		this.isMobile = isMobile.any;
		this.UI = new GameUI(this.isMobile);
		this.renderer = new RenderingLoop(this, this.UI.container);
		this.camera = new Camera(this.renderer.canvas, settings.interpolation);
		this.map = new GameMap(this.renderer.worldContainer);
		this.IDAllocator = new IDAllocator();
		this.entities = Entity.list;
		this.settings = settings;
		this.config = config;


		this.init();


		new Timer(() => {
			this.UI.FPS.text = `${ Math.round(this.renderer.frames) } FPS`;

			this.renderer.frames = 0;
		}, 1000, false, true);
	}


	public async init(): Promise<void> {
		credit("CLIENT");

		log("CLIENT", "Successfully initiated the game");


		// Load necessary content (elements in loads need to be loaded before connecting to the server)
		const loads = [
			loadAssets()
		];


		// Retrieve settings saved in localStorage
		this.retrieveSettings();


		// Initialize the renderer
		this.renderer.init(this.settings.rendering);


		// Initialize the HUD
		this.UI.init(this.renderer.scale, this.renderer.canvas);


		// Set the camera position to a random point on the map
		this.camera.move(
			getRandomInt(this.map.bounds.min.x, this.map.bounds.max.x),
			getRandomInt(this.map.bounds.min.y, this.map.bounds.max.y),
			true
		);


		await Promise.all(loads);
	}


	public async update(count: number): Promise<void> {
		await this.sharedBuffer!.lockAsync();

		const buffer = this.sharedBuffer!.unlinkReader();

		for (let i = 0; i < count; i++) {
			const encoder = buffer.readUint8();

			const event = updates[encoder] as keyof typeof updates;

			switch (event) {
				case "createEntity": {
					const rawType = buffer.readUint8();

					const type = getTypeDecoder(rawType);

					Entity.create(type, buffer);

					break;
				}
					
				case "destroyEntity": {
					const id = buffer.readUint16();

					Entity.get(id)?.destroy();

					break;
				}


				case "position": {
					const id = buffer.readUint16();

					Entity.get(id)?.update(buffer);

					break;
				}
			}

			// Flags aren't merged between different updates within the world update
			buffer.lastBitIndex = 0;
		}

		this.sharedBuffer!.unlock();
	}


	public startSimulation(): void {
		this.sharedBuffer = game.createBuffer();

		const thread = new Simulation();

		this.simulation = new Thread(thread);

		this.simulation.send("init", {
			buffer: game.sharedBuffer?.buffer,
			entities: game.config.entities,
		});

		this.simulation.on("update", game.update.bind(this));

		this.simulation.on("stats", function(stats: any) {
			game.UI.TPS.text = `${ stats.TPS } TPS`;

			game.UI.mspt.text = `${ stats.mspt } mspt`;
		});


		document.getElementById("menu")!.style.display = "none";
		document.getElementById("gameUI")!.style.display = "block";
	}


	public stopSimulation(): void {
		this.simulation?.terminate();
	}	


	public createBuffer(): SharedBuffer {
		return new SharedBuffer(4 + 14 * (this.config.entities.plant + this.config.entities.herbivore + this.config.entities.carnivore) + 5000);
	}


	// Apply settings saved in localStorage
	private retrieveSettings(): void {

	}
}


const game = new Game();



export { Game, game };