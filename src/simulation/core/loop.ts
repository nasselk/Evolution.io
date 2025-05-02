import { type DynamicEntity } from "../entities/dynamicEntity";

import { dynamicTypes } from "../../shared/connector";

import { nextTick } from "../../utils/timers/tick";

import { Timer } from "../../utils/timers/timer";

import { Simulation } from "./simulation";



class GameLoop {
	private readonly game: Simulation;
	private readonly minTickDelta: number;
	private lastStatDisplay: number;
	private lastTick: number;
	private ticks: number;
	private mspt: number;
	public tick: number;
	
	
	public constructor(game: Simulation) {
		this.game = game;
		this.minTickDelta = this.game.config.TPS === 0 ? 0 : 1000 / this.game.config.TPS;
		this.lastTick = this.lastStatDisplay = performance.now();
		this.ticks = 0;
		this.mspt = 0;
		this.tick = 0;
	}


	public updateGameState(): void {
		const now: number = performance.now();
		const deltaTime: number = Math.min(now - this.lastTick, 1000);
		

		if (this.game.config.turbo) {
			nextTick(this.updateGameState.bind(this));
		}

		else {
			// 1ms because setTimeout is inaccurate
			setTimeout(this.updateGameState.bind(this), 1);
		}


		// If deltaTime is greater or equal to the server maximum tick rate then update the game state
		if (deltaTime >= this.minTickDelta) {
			this.lastTick = now;


			Timer.runAll(now);

			
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
				entity1.dynamicInteraction(entity2);
			}, minID, maxID, false);


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

			this.tick++;
		}
	}


	private processOutboundMessages(): void {
		this.game.sharedBuffer?.lock();


		// Add entities updates
		for (const entity of this.game.entities.values()) {
			if (entity.constructor.dynamic && entity.creationTick !== this.tick) {
				this.game.addWorldUpdate("position", (entity as DynamicEntity).packUpdates.bind(entity));
			}
		}


		// Send the updates to the socket thread (only if there are sockets connected to save resources on burst servers)
		if (this.game.updatesCount > 0) {
			this.game.renderingThread.send("update", this.game.updatesCount);

			// Reset the events
			this.game.sharedBuffer?.writer.reset();
			this.game.updatesCount = 0;
		}

		this.game.sharedBuffer?.unlock();
	}


	private displayStats(delay: number): void {
		const avgTPS = Math.ceil(this.ticks / delay * 1000);

		const avgMSPT = (this.mspt / this.ticks).toFixed(2);

		//const memoryUsage = Math.round(process.memoryUsage().rss / 1024 / 1024);

		this.game.renderingThread.send("stats", {
			TPS: avgTPS,
			mspt: avgMSPT,
		});
	}
}



export { GameLoop };