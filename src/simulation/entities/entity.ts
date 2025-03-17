import { getTypeEncoder, entityTypes as primitiveTypes } from "../../shared/connector";

import { Interval } from "../../utils/timers/interval";

import { MsgWriter } from "../../utils/thread/writer";

import { type DynamicEntity } from "./dynamicEntity";

import { Timeout } from "../../utils/timers/timeout";

import { HashGrid2D } from "../physic/HashGrid2D";

import { Vector } from "../../utils/math/vector";

import { getUnusedID } from "../../utils/getID";

import { Collider } from "../physic/collider";

import { type game } from "../index";

import { type Biome } from "../map";



type EntityTypes = keyof typeof game.classes;


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


abstract class Entity {
	public static readonly list = new Map<number, Entity | DynamicEntity>();
	public static readonly savedPlayers = new Map<string, InstanceType<(typeof game.classes.animal)>>();
	private static readonly reservedIDs = new Set<number>();
	public static readonly isSubType: boolean = false;
	public static type: keyof typeof primitiveTypes;
	public static game: typeof game;
	public static dynamic: boolean;


	public readonly id: number;
	public readonly cellsKeys: Set<number>[];
	protected readonly observable: { health: number, size: Vector };
	public readonly type: keyof typeof primitiveTypes;
	protected readonly creation: number;
	public readonly position: Vector;
	public readonly size: Vector;
	protected health: number;
	public angle: number;
	public queryID: number;
	public spawned: boolean;
	public mass: number;
	declare ["constructor"]: typeof Entity;
	public abstract readonly collider: Collider<this>;	
	public interaction?<T extends Entity>(entity: T, ...args: any[]): void;


	protected constructor(options: ConstructorOptions) {
		this.position = new Vector();
		this.health = options.health ?? 100;
		this.id = getUnusedID(Entity.list, Entity.reservedIDs);
		this.cellsKeys = new Array(HashGrid2D.gridCount).fill(new Set());
		this.size = new Vector(options.size ?? options.width, options.size ?? options.height ?? options.width);
		this.observable = { health: this.health, size: this.size.clone };
		this.creation = performance.now();
		this.type = this.constructor.type;
		this.angle = options.angle ?? 0;
		this.mass = Infinity; // Entity are by default static
		this.spawned = true;
		this.queryID = 0;


		if (options.position) {
			this.position.set(options.position);
		}

		else if (options.x !== undefined) {
			this.position.set(options.x, options.y ?? 0);
		}


		// Save the entity in the main list there (in the constructor then we can create other entitiy within the constructor without id conflict)
		Entity.list.set(this.id, this);
	}
	

	public static create<T extends EntityTypes>(type: T, ...args: ConstructorParameters<typeof game.classes[T]>): InstanceType<typeof game.classes[T]> {
		const constructor = Entity.game.classes[type] as any;

		const entity = new constructor(...args) as InstanceType<typeof game.classes[T]>;

		constructor.list.set(entity.id, entity);

		Entity.game.addWorldUpdate("createEntity", entity.packProperties());

		return entity;
	}


	public static has<T extends EntityTypes>(id: number, type?: T): boolean {
		const entity = Entity.get<T>(id);

		return Boolean(entity && (!type || entity.type === type));
	}


	public static get<T extends EntityTypes | undefined>(id: number): (T extends EntityTypes ? InstanceType<typeof game.classes[T]> : Entity) | undefined {
		return Entity.list.get(id) as ReturnType<typeof this.get<T>>;
	}


	public static clear(...types: EntityTypes[]): void {
		for (const obj of Entity.list.values()) {
			if (types.includes(obj.type) || types.length === 0) {
				obj.destroy();
			}
		}
	}


	public destroy(): void {
		Entity.list.delete(this.id);

		Entity.game.classes[this.type].list.delete(this.id);

		
		// Make sure the ID is not reused for 1 second (for client-side animations)
		Entity.reservedIDs.add(this.id);

		new Timeout(() => {
			Entity.reservedIDs.delete(this.id);
		}, 1000);


		const buffer = new MsgWriter(2);

		buffer.writeUint16(this.id);

		Entity.game.addWorldUpdate("destroyEntity", buffer);

		
		this.spawned = false;

		this.cleanup();
	}
	

	private cleanup(): void {
		for (const key in this) {
			if (this[key] instanceof Timeout || this[key] instanceof Interval) {
				this[key].clear();
			}

			delete this[key];
		}
	}


	protected storeProperties(): void {
		this.observable.health = this.health;
		this.observable.size.set(this.size);
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
		if (this.cellsKeys[Entity.game.staticGrid.id].size > 0) {
			Entity.game.staticGrid.move(this, this.collider.size.x, this.collider.size.y);
		}
	}


	public packProperties(additionalBytes: number = 0): MsgWriter {
		const buffer = new MsgWriter(14 + additionalBytes);


		const type = getTypeEncoder(this.type);

		buffer.writeUint16(type);
		buffer.writeUint16(this.id);

		const x = MsgWriter.toPrecision(this.position.x, this.constructor.game.map.bounds.max.x, 16);
		const y = MsgWriter.toPrecision(this.position.y, this.constructor.game.map.bounds.max.y, 16);

		buffer.writeUint16(x);
		buffer.writeUint16(y);

		buffer.writeFloat32(this.angle);
		buffer.writeUint16(this.size.x);


		return buffer;
	}
}



function defineCustomType(name: EntityTypes, extent?: keyof typeof primitiveTypes) {
	return function<T extends typeof Entity>(target: T): void {
		const type = (extent || name) as keyof typeof primitiveTypes;

		target.type = type;
		target.dynamic = primitiveTypes[type].has("dynamic");
	};
}



export { Entity, type ConstructorOptions, type EntityTypes, defineCustomType };