import { defineCustomType, Entity, type EntityTypes } from "../entities/entity";

import { SharedBuffer } from "../../shared/thread/sharedBuffer";

import { type DynamicEntity } from "../entities/dynamicEntity";

import { ThreadEvents } from "../../shared/thread/events";

import { Spawner } from "../entities/spawn/spawner";

import { Thread } from "../../shared/thread/thread";

import { HashGrid2D } from "../physic/HashGrid2D";

import { spawn } from "../entities/spawn/spawn";

import { getRandomInt } from "../../math/point";

import * as classes from "../entities/manager";

import { log } from "../../utils/logger";

import config from "../../config.json";

import { GameLoop } from "./loop";

import { GameMap } from "../map";

class Simulation {
	private static _instance: Simulation;

	public readonly renderingThread: Thread;
	public readonly dynamicGrid: HashGrid2D<DynamicEntity>;
	public readonly staticGrid: HashGrid2D<Entity, typeof classes>;
	public readonly entities: typeof Entity.list;
	public readonly classes: typeof classes;
	public readonly config: typeof config;
	public sharedBuffer?: SharedBuffer;
	public readonly spawner: Spawner;
	public readonly loop: GameLoop;
	public readonly map: GameMap;
	public FOVThread?: Thread;

	public constructor() {
		this.config = config;
		this.map = new GameMap();
		this.classes = classes satisfies Record<EntityTypes, typeof Entity<EntityTypes>>;
		this.dynamicGrid = new HashGrid2D(150, 150, this.map.bounds.max.x, this.map.bounds.max.y, false);
		this.staticGrid = new HashGrid2D(500, 500, this.map.bounds.max.x, this.map.bounds.max.y, true, this.classes);
		this.renderingThread = new Thread(self);
		this.loop = new GameLoop(this);
		this.entities = Entity.list;

		if (!this.config.seed) {
			this.config.seed = getRandomInt(0, 2 ** 32); // Generate a random seed
		}

		this.spawner = new Spawner(this.config.seed);

		this.initConstructors();
	}

	// Singleton instance
	public static get instance(): Simulation {
		if (!this._instance) {
			this._instance = new Simulation();
		}

		return this._instance;
	}

	public threadListeners(): void {
		// Events from the rendering thread
		this.renderingThread.on(ThreadEvents.INIT, (data) => {
			this.init(data);
		});

		this.renderingThread.on(ThreadEvents.PAUSE, (paused: boolean) => {
			this.loop.paused = paused;
		});

		this.renderingThread.on(ThreadEvents.SPEED, (speed: number) => {
			this.loop.speed = speed;
		});

		this.renderingThread.on(ThreadEvents.MOVE, (data) => {
			const entity = Entity.get(data.id);

			entity?.position.set(data.x, data.y);
		});

		this.renderingThread.on(ThreadEvents.DESTROY, (id: number) => {
			const entity = Entity.get(id);

			entity?.destroy();
		});
	}

	public init(data: any): void {
		// Recieve the shared memory buffer from the main thread and the config
		this.sharedBuffer = new SharedBuffer(data.buffer);

		this.config.entities = data.entities;

		spawn(this.spawner, this.config, this.map);

		log("SIMULATION", "Simulation successfully started in version !");
		log("SIMULATION", "Seed:", this.config.seed);

		// Start the game loop
		this.loop.updateGameState();
	}

	// Register all classes types custom properties (dynamic, updatable, ...)
	private initConstructors(): void {
		for (const [name, constructor] of Object.entries(this.classes)) {
			const decorate = defineCustomType(name as keyof typeof classes);

			decorate(constructor);
		}
	}
}

export { Simulation };

export default Simulation.instance;
