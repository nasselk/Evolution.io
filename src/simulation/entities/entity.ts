import { getTypeEncoder, entityTypes as primitiveTypes } from "../../shared/connector";

import { BufferWriter } from "../../shared/thread/writer";

import { type DynamicEntity } from "./dynamicEntity";

import { HashGrid2D } from "../physic/HashGrid2D";

import { Vector } from "../../utils/math/vector";

import { Timer } from "../../utils/timers/timer";

import { Simulation } from "../core/simulation";

import { Collider } from "../physic/collider";

import { type Biome } from "../map";



type EntityTypes = keyof typeof Simulation.instance.classes;


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
	public static readonly isSubType: boolean = false;
	public static type: keyof typeof primitiveTypes;
	public static dynamic: boolean;


	public readonly id: number;
	public readonly cellsKeys: Set<number>[];
	public readonly type: keyof typeof primitiveTypes;
	protected readonly creation: number;
	public readonly position: Vector;
	public readonly size: Vector;
	public health: number;
	public mass: number;
	public angle: number;
	public queryID: number;
	public spawned: boolean;
	protected lastReproduction;
	public readonly creationTick?: number;
	declare ["constructor"]: typeof Entity;
	public abstract readonly collider: Collider<this>;	
	public interaction?<T extends Entity>(entity: T, ...args: any[]): void;


	protected constructor(options: ConstructorOptions = {}) {
		this.position = new Vector();
		this.health = options.health ?? 100;
		this.cellsKeys = new Array(HashGrid2D.gridCount).fill(new Set());
		this.size = new Vector(options.size ?? options.width, options.size ?? options.height ?? options.width);
		this.id = Simulation.instance.spawner.IDAllocator.allocate();
		this.creationTick = Simulation.instance.loop.tick;
		this.creation = performance.now();
		this.type = this.constructor.type;
		this.angle = options.angle ?? 0;
		this.lastReproduction = 0;
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
	

	public static create<T extends EntityTypes>(type: T, ...args: ConstructorParameters<typeof Simulation.instance.classes[T]>): InstanceType<typeof Simulation.instance.classes[T]> {
		const constructor = Simulation.instance.classes[type] as any;

		const entity = new constructor(...args) as InstanceType<typeof Simulation.instance.classes[T]>;

		constructor.list.set(entity.id, entity);

		return entity;
	}


	public static has<T extends EntityTypes>(id: number, type?: T): boolean {
		const entity = Entity.get<T>(id);

		return Boolean(entity && (!type || entity.type === type));
	}


	public static get<T extends EntityTypes | undefined>(id: number): (T extends EntityTypes ? InstanceType<typeof Simulation.instance.classes[T]> : Entity) | undefined {
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

		Simulation.instance.classes[this.type].list.delete(this.id);

		
		// Make sure the ID is not reused for 1 second (for client-side animations)
		new Timer(() => {
			Simulation.instance.spawner.IDAllocator.free(this.id);
		}, 1000, true);


		const buffer = new BufferWriter(2);

		buffer.writeUint16(this.id);

		
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
		if (this.cellsKeys[Simulation.instance.staticGrid.id].size > 0) {
			Simulation.instance.staticGrid.move(this, this.collider.size.x, this.collider.size.y);
		}
	}


	public packProperties(writer?: BufferWriter, additionalBytes: number = 0): BufferWriter {
		const buffer = writer ?? new BufferWriter(10 + additionalBytes);


		const type = getTypeEncoder(this.type);

		buffer.writeUint8(type);
		buffer.writeUint16(this.id);

		const x = BufferWriter.toPrecision(this.position.x, Simulation.instance.map.bounds.max.x, 16);
		const y = BufferWriter.toPrecision(this.position.y, Simulation.instance.map.bounds.max.y, 16);

		buffer.writeUint16(x);
		buffer.writeUint16(y);

		const angle = BufferWriter.toPrecision(this.angle, 2 * Math.PI, 8, 0);
		buffer.writeUint8(angle);

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