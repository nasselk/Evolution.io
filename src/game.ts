import { defineCustomType, Entity } from "./rendering/entities/entity";

import { SharedBuffer } from "./shared/thread/sharedBuffer";

import { RenderingLoop } from "./rendering/core/renderer";

import Simulation from "./simulation/index?worker&inline";

import * as classes from "./rendering/entities/manager";

import { updateSimulationData } from "./UI/stores/HUD";

import { ThreadEvents } from "./shared/thread/events";

import { Entities } from "./shared/entities/types";

import { IDAllocator } from "./utils/IDAllocator";

import { Camera } from "./rendering/core/camera";

import { Thread } from "./shared/thread/thread";

import { credit, log } from "./utils/logger";

import { loadAssets } from "./loader/global";

import { Timer } from "./utils/timers/timer";

import { getRandomInt } from "./math/point";

import { GameMap } from "./rendering/map";

import { BitSet } from "./utils/bitset";

import settings from "./settings.json";

import { isMobile } from "pixi.js";

import config from "./config.json";



class Game {
	private static _instance?: Game;

	public readonly camera: Camera;
	public readonly config: typeof config;
	public readonly classes: typeof classes;
	public readonly settings: typeof settings;
	public readonly entities: typeof Entity.list;
	public readonly IDAllocator: IDAllocator;
	public readonly renderer: RenderingLoop;
	private readonly updateIDs: BitSet;
	private sharedBuffer?: SharedBuffer;
	public readonly isMobile: boolean;
	public readonly map: GameMap;
	public simulation?: Thread;


	private constructor() {
		this.classes = classes;
		this.isMobile = isMobile.any;
		this.renderer = new RenderingLoop(this);
		this.camera = new Camera(this.renderer.canvas, settings.interpolation);
		this.map = new GameMap(this.renderer.worldContainer);
		this.IDAllocator = new IDAllocator();
		this.updateIDs = new BitSet();
		this.entities = Entity.list;
		this.settings = settings;
		this.config = config;

		new Timer(() => {
			this.renderer.frames = 0;
		}, 1000, true);
	}


	public static get instance(): Game {
		if (!this._instance) {
			this._instance = new Game();
		}

		return this._instance;
	}


	public async init(): Promise<void> {
		credit("RENDERER");

		log("RENDERER", "Successfully initiated the app");


		// Load necessary content (elements in loads need to be loaded before connecting to the server)
		const loads = [
			loadAssets()
		];


		this.initConstructors();


		// Retrieve settings saved in localStorage
		this.retrieveSettings();


		// Initialize the renderer
		this.renderer.init(this.settings.rendering);


		// Set the camera position to a random point on the map
		this.camera.move(
			getRandomInt(this.map.bounds.min.x, this.map.bounds.max.x),
			getRandomInt(this.map.bounds.min.y, this.map.bounds.max.y),
			true
		);


		await Promise.all(loads);
	}


	private initConstructors(): void {
		for (const [ name, constructor ] of Object.entries(this.classes)) {
			const decorate = defineCustomType(name as keyof typeof classes);

			decorate(constructor);
		}
	}


	private threadListeners(): void {
		this.simulation?.on(ThreadEvents.UPDATE, this.update.bind(this));

		this.simulation?.on(ThreadEvents.STATS, (stats: any) => {
			//this.UI.TPS.text = `${stats.TPS} TPS`;

			//this.UI.mspt.text = `${stats.mspt} mspt`;

			console.log(stats);

			updateSimulationData(stats.uptime, stats.carnivores, stats.herbivores, stats.plants);
		});
	}


	public async update(count: number): Promise<void> {
		if (this.sharedBuffer) {
			this.sharedBuffer.lockAsync();

			this.sharedBuffer.reader.reset();

			this.updateIDs.clear();


			for (let i = 0; i < count; i++) {
				const rawType = this.sharedBuffer.reader.readUint8();
				const id = this.sharedBuffer.reader.readUint16();

				const type = Entities[rawType] as keyof typeof Entities;

				const entity = Entity.get(id);

				if (entity) {
					entity.update(this.sharedBuffer.reader);
				}

				else {
					Entity.create(type, id, this.sharedBuffer.reader);
				}

				this.updateIDs.add(id);

				// Flags aren't merged between different updates within the world update
				this.sharedBuffer.reader.lastBitIndex = 0;
			}


			this.sharedBuffer.unlock();


			for (const entity of Entity.list.values()) {
				if (!this.updateIDs.has(entity.id)) {
					entity.destroy();
				}
			}
		}
	}


	public startSimulation(): void {
		this.sharedBuffer = this.createBuffer();
		this.updateIDs.resize(this.sharedBuffer.byteLength);

		const thread = new Simulation();

		this.simulation = new Thread(thread);

		this.simulation.send(ThreadEvents.INIT, {
			buffer: this.sharedBuffer?.buffer,
			entities: this.config.entities,
		});

		this.threadListeners();

		document.querySelector<HTMLDivElement>("#menu")!.style.display = "none";
		document.querySelector<HTMLDivElement>("#HUD")!.style.display = "grid";
	}


	public setSimulationState(paused: boolean): void {
		this.simulation?.send(ThreadEvents.PAUSE, paused);
	}


	public stopSimulation(): void {
		this.simulation?.terminate();

		for (const entity of Entity.list.values()) {
			entity.destroy();
		}

		document.querySelector<HTMLDivElement>("#menu")!.style.display = "grid";
		document.querySelector<HTMLDivElement>("#HUD")!.style.display = "none";
	}


	public setSimulationSpeed(speed: number): void {
		this.simulation?.send(ThreadEvents.SPEED, speed);
	}
	

	public createBuffer(): SharedBuffer {
		return new SharedBuffer(100 * 10 * (this.config.entities.plant + this.config.entities.herbivore + this.config.entities.carnivore));
	}


	// Apply settings saved in localStorage
	private retrieveSettings(): void {

	}
}



export { Game };

export default Game.instance;