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

import updates from "../../shared/updates";

import { log } from "../../utils/logger";

import config from "../../config.json";

import { GameLoop } from "./loop";

import { GameMap } from "../map";




class Game {
	public readonly renderingThread: Thread;
	public readonly dynamicGrid: HashGrid2D<DynamicEntity>;
	public readonly staticGrid: HashGrid2D<Entity, typeof classes>;
	public readonly entities: typeof Entity.list;
	public readonly classes: typeof classes;
	public readonly config: typeof config;
	public sharedBuffer?: SharedBuffer;
	public readonly spawner: Spawner;
	private readonly loop: GameLoop;
	public readonly map: GameMap;
	public updatesCount: number;
	public FOVThread?: Thread;

	
	public constructor() {
		this.config = config;
		this.map = new GameMap();
		this.classes = classes satisfies Record<EntityTypes, typeof Entity>;
		this.dynamicGrid = new HashGrid2D(200, 200, this.map.bounds.max.x, this.map.bounds.max.y, false);
		this.staticGrid = new HashGrid2D(500, 500, this.map.bounds.max.x, this.map.bounds.max.y, true, this.classes);
		this.renderingThread = new Thread(self);
		this.loop = new GameLoop(this);
		this.entities = Entity.list;
		this.updatesCount = 0;
		

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
	public addWorldUpdate(type: keyof typeof updates, param?: MsgWriter | ((writer: MsgWriter) => MsgWriter)): void {
		const encoder = updates[type];

		this.sharedBuffer?.writer.writeUint8(encoder);

		if (param instanceof MsgWriter) {
			const buffer = param.bytes;

			this.sharedBuffer?.writer.writeBuffer(buffer);
		}

		// Callback to write the data directly (2x faster)
		else if (param) {
			param(this.sharedBuffer!.writer);
		}
		

		this.updatesCount++;
	}
}



export { Game };