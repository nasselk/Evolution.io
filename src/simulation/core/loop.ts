import { type DynamicEntity } from "../entities/dynamicEntity";

import { dynamicTypes } from "../../utils/thread/connector";

import { log } from "../../utils/logger";

import { Game } from "./simulation";



class GameLoop {
	private readonly game: Game;
	private readonly minTickDelta: number;
	private lastStatDisplay: number;
	private lastTick: number;
	private ticks: number;
	private mspt: number;
	
	
	public constructor(game: Game) {
		this.game = game;
		this.minTickDelta = this.game.config.TPS === 0 ? 0 : 1000 / this.game.config.TPS;
		this.lastTick = this.lastStatDisplay = performance.now();
		this.ticks = 0;
		this.mspt = 0;
	}


	public updateGameState(): void {
		// 1 bcs setTimeout is not accurate anyways
		setTimeout(this.updateGameState.bind(this), 1);
		

		const now: number = performance.now();
		const deltaTime: number = Math.min(now - this.lastTick, 1000);
		

		// If deltaTime is greater or equal to the server maximum tick rate then update the game state
		if (deltaTime >= this.minTickDelta) {
			this.lastTick = now;

			
			let minID: number = Infinity;
			let maxID: number = -Infinity;


			// Update dynamic entities
			for (const type of dynamicTypes) {
				for (const entity of this.game.classes[type].list.values() as unknown as DynamicEntity[]) {
					// Update the entity
					entity.update(deltaTime / 10, this.game.map);

					// Insert into the grid for pairwise collision
					this.game.dynamicGrid.insert(entity);

					// Find the min and max IDs of dynamic entities for the pairwise collision check
					if (entity.id < minID) {
						minID = entity.id;
					}

					else if (entity.id > maxID) {
						maxID = entity.id;
					}
				}
			}


			// Do the pairwise interactions check
			this.game.dynamicGrid.pairwiseCombination(function (entity1, entity2) {
				entity1.collider!.collide(entity2.collider!);
			}, minID, maxID);


			this.processOutboundMessages();

			this.game.dynamicGrid.clear();
	

			if (this.game.config.ENV === "development") {
				this.ticks++;

				this.mspt += performance.now() - now;

				const statsDelay: number = now - this.lastStatDisplay;

				if (statsDelay >= 1000) {
					this.displayStats(statsDelay);

					this.mspt = 0;

					this.ticks = 0;

					this.lastStatDisplay = now;
				}
			}
		}
	}


	private processOutboundMessages(): void {
		// Add entities updates
		for (const entity of this.game.entities.values()) {
			if (entity.constructor.dynamic) {
				this.game.addWorldUpdate("position", entity.packUpdates());
			}
		}


		// Send the updates to the socket thread (only if there are sockets connected to save resources on burst servers)
		if (this.game.updates.count > 0) {
			this.game.writeUpdates();

			this.game.renderingThread.send("update", this.game.updates.count);

			// Reset the events
			this.game.updates.global = {};
			this.game.updates.count = 0;
			this.game.updates.byteLength = 0;
		}
	}


	private displayStats(delay: number): void {
		const avgTPS = Math.ceil(this.ticks / delay * 1000);

		const avgMSPT = (this.mspt / this.ticks).toFixed(2);

		//const memoryUsage = Math.round(process.memoryUsage().rss / 1024 / 1024);

		log(
			"Game Server",
			this.game.entities.size, "entities",
			"·", avgTPS, "TPS",
			"·", avgMSPT, "mspt",
			//"·", memoryUsage + "MB"
		);
	}
}



export { GameLoop };