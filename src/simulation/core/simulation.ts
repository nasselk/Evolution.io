import { getUpdateEncoder, type updates } from "../../utils/thread/connector";

import { type DynamicEntity } from "../entities/dynamicEntity";

import { SharedBuffer } from "../../utils/thread/sharedBuffer";

import { Entity, type EntityTypes } from "../entities/entity";

import { getRandomInt } from "../../utils/math/point";

import { MsgWriter } from "../../utils/thread/writer";

import { Spawner } from "../entities/spawn/spawner";

import { Thread } from "../../utils/thread/thread";

import { HashGrid2D } from "../physic/HashGrid2D";

import { spawn } from "../entities/spawn/spawn";

import * as classes from "../entities/manager";

import { log } from "../../utils/logger";

import config from "../config.json";

import { GameLoop } from "./loop";

import { GameMap } from "../map";



type worldUpdates = {
	global: Partial<{ [key in typeof updates[number]]: Uint8Array[] }>,
	byteLength: number,
	count: number,
}



class Game {
	public readonly renderingThread: Thread;
	public readonly dynamicGrid: HashGrid2D<DynamicEntity>;
	public readonly staticGrid: HashGrid2D<Entity, typeof classes>;
	public readonly entities: typeof Entity.list;
	public readonly classes: typeof classes;
	public readonly config: typeof config;
	public readonly updates: worldUpdates;
	public sharedBuffer?: SharedBuffer;
	public readonly spawner: Spawner;
	private readonly loop: GameLoop;
	public readonly map: GameMap;
	public FOVThread?: Thread;

	
	public constructor() {
		this.config = config;
		this.map = new GameMap();
		this.classes = classes satisfies Record<EntityTypes, typeof Entity>;
		this.dynamicGrid = new HashGrid2D(500, 500, this.map.bounds.max.x, this.map.bounds.max.y, false);
		this.staticGrid = new HashGrid2D(500, 500, this.map.bounds.max.x, this.map.bounds.max.y, true, this.classes);
		this.renderingThread = new Thread(self);
		this.loop = new GameLoop(this);
		this.entities = Entity.list;
		this.updates = {
			global: {},
			byteLength: 0,
			count: 0,
		};
		

		if (!this.config.seed) {
			this.config.seed = getRandomInt(0, 2 ** 32);
		}
		
		this.spawner = new Spawner(this.config.seed);


		this.renderingThread.on("init", (buffer) => {
			this.init(buffer);
		});
	}


	public init(sharedBuffer: SharedArrayBuffer): void {
		this.sharedBuffer = new SharedBuffer(sharedBuffer);


		Entity.game = this;

		spawn(this.spawner, this.config, this.map);


		log("Game Server", "Server successfully started in version", config.gameVersion, "!");
		log("Game Server", "Seed:", this.config.seed);
		
		
		// Start the game loop
		this.loop.updateGameState();
	}
	

	// Add a tick udpate
	public addWorldUpdate(type: typeof updates[number], data?: MsgWriter): void {
		const buffer = data?.bytes;

		if (!this.updates.global[type]) {
			this.updates.global[type] = [];

			this.updates.byteLength += 2;
		}

		if (buffer) {
			this.updates.global[type].push(buffer);

			this.updates.byteLength += buffer.byteLength;
		}

		this.updates.count++;
	}


	public writeUpdates(): void {
		this.sharedBuffer?.writer.reset();


		const buffer = new MsgWriter(this.updates.byteLength);

		//console.log(this.updates.global, performance.now());

		for (const [ key, updates ] of Object.entries(this.updates.global)) {
			const encoder = getUpdateEncoder(key as any);

			buffer.writeUint16(encoder); // event

			for (const update of updates) {
				buffer.writeBuffer(update);
			}
		}

		
		this.sharedBuffer?.writer.writeBuffer(buffer.bytes);
	}
}



export { Game };