import { EntitiesConfig } from "../../shared/entities/properties";

import { BufferWriter } from "../../shared/thread/writer";

import { Entities } from "../../shared/entities/types";

import { type DynamicEntity } from "./dynamicEntity";

import { removeFromArray } from "../../utils/utils";

import { HashGrid2D } from "../physic/HashGrid2D";

import { Vector } from "../../math/vector";

import { Timer } from "../../utils/timers/timer";

import { Collider } from "../physic/collider";

import Simulation from "../core/simulation";

import { type Biome } from "../map";



type EntityTypes = keyof typeof Entities;
type GetEntityInstanceType<T extends keyof typeof Entities> = InstanceType<(typeof Simulation.classes)[T]>;


interface ConstructorOptions {
	readonly position?: Vector;
	readonly x?: number,
	readonly y?: number,
	readonly size?: number;
	readonly width?: number;
	readonly height?: number;
	readonly angle?: number;
	readonly health?: number;
	readonly biome?: Biome;
	readonly mass?: number,
}


abstract class Entity<T extends EntityTypes = EntityTypes> {
	public static readonly updatables: Entity[] = [];
	public static readonly list = new Map<number, Entity | DynamicEntity>();
	public static readonly isSubType: boolean = false;
	public static type: keyof typeof Entities;
	public static updatable: boolean;
	public static dynamic: boolean;
	

	public readonly id: number;
	public readonly cellsKeys: Set<number>[];
	protected readonly creation: number;
	public readonly position: Vector;
	public readonly size: Vector;
	public readonly type: T;
	public health: number;
	public mass: number;
	public angle: number;
	public queryID: number;
	public spawned: boolean;
	protected lastReproduction: number;
	private updateIndex?: number | null;
	protected reproductionCooldown: number;
	declare ["constructor"]: typeof Entity;
	public abstract readonly collider: Collider<this>;	
	protected staticInteraction?(objects: Parameters<Parameters<typeof Simulation.staticGrid.query>[1]>[0], queryID: number): boolean | void;


	protected constructor(options: ConstructorOptions = {}) {
		this.position = new Vector();
		this.cellsKeys = new Array(HashGrid2D.gridCount).fill(new Set());
		this.size = new Vector(options.size ?? options.width, options.size ?? options.height ?? options.width);
		this.id = Simulation.spawner.IDAllocator.allocate();
		this.type = this.constructor.type as T;
		this.creation = performance.now();
		this.angle = options.angle ?? 0;
		this.lastReproduction = 0;
		this.mass = Infinity; // Entity are by default static
		this.spawned = true;
		this.queryID = 0;


		// Settings :
		this.reproductionCooldown = 10000; // 10 seconds
		this.health = this.size.x * 2;


		if (options.position) {
			this.position.set(options.position);
		}

		else if (options.x !== undefined) {
			this.position.set(options.x, options.y ?? 0);
		}


		if (this.constructor.updatable) {
			this.updatable = true;
		}
	}
	

	public static create<T extends EntityTypes>(type: T, ...args: ConstructorParameters<typeof Simulation.classes[T]>): InstanceType<typeof Simulation.classes[T]> {
		const constructor = Simulation.classes[type] as any;

		const entity = new constructor(...args) as InstanceType<typeof Simulation.classes[T]>;

		constructor.list.set(entity.id, entity);
		Entity.list.set(entity.id, entity);

		return entity;
	}


	public static has<T extends EntityTypes>(id: number, type?: T): boolean {
		const entity = Entity.get<T>(id);

		return Boolean(entity && (!type || entity.type === type));
	}


	public static get<T extends EntityTypes | undefined>(id: number): (T extends EntityTypes ? InstanceType<typeof Simulation.classes[T]> : Entity) | undefined {
		return Entity.list.get(id) as ReturnType<typeof this.get<T>>;
	}


	public static clear(...types: EntityTypes[]): void {
		for (const obj of Entity.list.values()) {
			if (types.includes(obj.type) || types.length === 0) {
				obj.destroy();
			}
		}
	}


	public update(deltaTime?: number, now?: number): void {
		void deltaTime;
		void now;

		if (this.staticInteraction) {
			Simulation.staticGrid.query(this, this.staticInteraction);
		}
	}


	public destroy(): void {
		this.updatable = false;

		Entity.list.delete(this.id);

		Simulation.classes[this.type].list.delete(this.id);

		
		// Make sure the ID is not reused for 1 second (for client-side animations)
		new Timer(() => {
			Simulation.spawner.IDAllocator.free(this.id);
		}, 1000);

		
		this.spawned = false;

		this.cleanup();
	}
	

	private cleanup(): void {
		for (const key in this) {
			if (this[key] instanceof Timer) {
				this[key].clear();
			}

			delete this[key];
		}
	}


	public resize(size: number): void;
	public resize(width: number, height: number): void;
	public resize(a: number, b?: number): void {
		if (a < 0 || b && b < 0) {
			throw new Error("Invalid size");
		}

		this.size.x = a;
		this.size.y = b ?? a;

		// Means it's inserted in the static grid
		if (this.cellsKeys[Simulation.staticGrid.id].size > 0) {
			Simulation.staticGrid.move(this, this.collider.size.x, this.collider.size.y);
		}
	}


	public packProperties(writer?: BufferWriter, additionalBytes: number = 0): BufferWriter {
		const buffer = writer ?? new BufferWriter(10 + additionalBytes);


		const type = Entities[this.type];

		buffer.writeUint8(type);
		buffer.writeUint16(this.id);

		const x = BufferWriter.toPrecision(this.position.x, Simulation.map.bounds.max.x, 16);
		const y = BufferWriter.toPrecision(this.position.y, Simulation.map.bounds.max.y, 16);

		buffer.writeUint16(x);
		buffer.writeUint16(y);

		const angle = BufferWriter.toPrecision(this.angle, 2 * Math.PI, 8);
		buffer.writeUint8(angle);

		buffer.writeUint16(this.size.x);


		return buffer;
	}


	set updatable(value: boolean) {
		if (value) {
			if (this.updateIndex === undefined || this.updateIndex === null) {
				this.updateIndex = Entity.updatables.push(this) - 1;
			}
		}

		else {
			if (this.updateIndex !== undefined && this.updateIndex !== null) {
				const element = removeFromArray(Entity.updatables, this, this.updateIndex);

				if (element) {
					element.updateIndex = this.updateIndex;
				}

				this.updateIndex = null;
			}
		}
	}
}



function defineCustomType(name: EntityTypes) {
	return function <T extends typeof Entity<EntityTypes>>(target: T): void {
		target.type = name;
		
		const properties = EntitiesConfig[name];
		
		if (properties) {
			target.updatable = properties.updatable;
			target.dynamic = properties.dynamic;
		}

		else {
			throw new Error(`Entity ${ name } not found in EntitiesConfig`);
		}
	};
}



export { Entity, type ConstructorOptions, type EntityTypes, type GetEntityInstanceType, defineCustomType };