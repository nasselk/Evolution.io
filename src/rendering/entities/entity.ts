import { interpolate, interpolateAngle } from "../../utils/math/interpolation";

import { entityTypes as primitiveTypes } from "../../shared/connector";

import { newContainer } from "../../rendering/createVisuals";

import { worldContainer } from "../../rendering/renderer";

import { BufferReader } from "../../shared/thread/reader";

import { getLayer } from "../../rendering/layers";

import { Vector } from "../../utils/math/vector";

import { Timer } from "../../utils/timers/timer";

import { Container } from "pixi.js";

import { game } from "../../game";



type EntityTypes = keyof typeof game.classes;
type GetEntityInstanceType<T extends EntityTypes> = InstanceType<(typeof game.classes)[T]>;


// Global entity class being used by all entities
abstract class Entity {
	public static readonly list: Map<number, Entity> = new Map();
	public static readonly container: Container = worldContainer;
	public static dynamic: boolean;
	public static type: EntityTypes;
	

	public readonly id: number;
	public readonly position: Vector;
	public readonly target: { readonly position: Vector, angle: number, readonly size: Vector, opacity: number };
	protected readonly interpolation: typeof game.settings.interpolation;
	protected readonly size: Vector;
	protected animationSpeed: number;
	protected container: Container;
	protected lastUpdate: number;
	protected initiated: boolean;
	private visibleScale: number;
	protected creation: number;
	protected spawned: boolean;
	protected angle: number;
	public readonly type: EntityTypes;
	protected abstract init(): void;
	declare ["constructor"]: typeof Entity;	

	protected constructor(id: number, properties: BufferReader) {
		const x = properties.readUint16();
		const y = properties.readUint16();
		const angle = properties.readUint8();

		this.position = new Vector(
			BufferReader.fromPrecision(x, game.map.bounds.max.x, 16),
			BufferReader.fromPrecision(y, game.map.bounds.max.y, 16),
		);

		this.id = id;
		this.angle = BufferReader.fromPrecision(angle, 2 * Math.PI, 8, 0);
		this.target = { position: this.position.clone, angle: this.angle, size: new Vector(properties.readUint16()), opacity: 1 };
		this.interpolation = game.settings.interpolation;
		this.type = this.constructor.type;
		this.creation = performance.now();
		this.animationSpeed = 0.1;
		this.size = new Vector();
		this.initiated = false;
		this.visibleScale = 1;
		this.spawned = true;
		this.lastUpdate = 0;

		
		this.container = newContainer({
			x: this.position.x,
			y: this.position.y,
			angle: this.angle,
			width: this.size.x,
			height: this.size.y,
			layer: getLayer(this.type),
		});


		this.constructor.container.addChild(this.container);
	}

		
	public static create<T extends EntityTypes>(type: T, ...args: ConstructorParameters<(typeof game.classes)[T]>): InstanceType<(typeof game.classes)[T]> {
		const constructor = game.classes[type] as any;

		const entity = new constructor(...args);


		Entity.get(entity.id)?.cleanup(); // Cleanup if entity with this id already exists


		Entity.list.set(entity.id, entity);

		entity.constructor.list.set(entity.id, entity);


		return entity;
	}


	public static has<T extends EntityTypes>(id: number, type?: T): boolean {
		const entity = Entity.get<T>(id);

		return Boolean(entity && (!type || entity.type === type));
	}


	public static get<T extends EntityTypes | undefined>(id: number): (T extends EntityTypes ? InstanceType<typeof game.classes[T]> : Entity) | undefined {
		return Entity.list.get(id) as ReturnType<typeof this.get<T>>;
	}


	public render(deltaTime: number): boolean | void  {
		if (this.constructor.dynamic) {
			this.position.x = interpolate(this.position.x, this.target.position.x, this.interpolation.moves, deltaTime);
			this.position.y = interpolate(this.position.y, this.target.position.y, this.interpolation.moves, deltaTime);
			this.angle = interpolateAngle(this.angle, this.target.angle, this.interpolation.angle, deltaTime);
		}
		
		this.size.x = interpolate(this.size.x, this.target.size.x, this.animationSpeed, deltaTime, 1);
		this.size.y = interpolate(this.size.y, this.target.size.y, this.animationSpeed, deltaTime, 1);


		return this.container.visible = !this.remove() && this.renderable; // this.remove() returns true if the entity is removed (one of size axis being 0 and not spawned anymore)
	}


	public update(buffer: BufferReader): this {
		const x = buffer.readUint16();
		const y = buffer.readUint16();
		const angle = buffer.readUint8();
		const size = buffer.readUint16();

		this.target.position.x = BufferReader.fromPrecision(x, game.map.bounds.max.x, 16);
		this.target.position.y = BufferReader.fromPrecision(y, game.map.bounds.max.y, 16);
		this.target.angle = BufferReader.fromPrecision(angle, 2 * Math.PI, 8, 0);
		this.target.size.set(size);

		return this;
	}


	public destroy(): void {
		if (this === game.camera.target.entity) {
			game.camera.target.entity = null;
		}

		for (const value of Object.values(this)) {
			if (value instanceof Timer) {
				value.clear();
			}
		}


		if (this.isVisible()) {
			this.target.size.x = 0;
			this.target.size.y = 0;

			this.animationSpeed = 0.1;
		}

		else {
			this.remove(true);
		}


		this.spawned = false;
	}


	protected remove(force: boolean = false): boolean {
		if (force || (this.size.x === 0 || this.size.y === 0) && !this.spawned) {
			Entity.list.delete(this.id);

			game.classes[this.type].list.delete(this.id);

			this.cleanup();

			return true;
		}

		else {
			return false;
		}
	}


	private cleanup(): void {
		for (const key in this) {
			if (this[key] instanceof Timer) {
				this[key].clear();
			}

			else if (this[key] instanceof Container) {
				this[key].destroy({ children: true/*, context: true*/ });
			}

			delete this[key];
		}
	}


	private isVisible(scale: number = this.visibleScale): boolean {
		const globalX = game.renderer.canvas.width / 2 + (this.position.x - game.camera.position.x) * game.camera.zoom;
		const globalY = game.renderer.canvas.height / 2 + (this.position.y - game.camera.position.y) * game.camera.zoom;

		let width = this.size.x * game.camera.zoom * scale;
		let height = this.size.y * game.camera.zoom * scale;

		if (this.angle != 0) {
			width *= Math.SQRT2;
			height *= Math.SQRT2;
		}

		return !document.hidden && width > 0 && height > 0 && globalX + width / 2 > 0 && globalX - width / 2 < game.renderer.canvas.width && globalY + height / 2 > 0 && globalY - height / 2 < game.renderer.canvas.height;
	}

	
	private get renderable(): boolean {
		return this.initiated && this.isVisible();
	}
}



function defineCustomType(name: EntityTypes, layer?: number) {
	return function<T extends typeof Entity>(target: T) {
		if (layer === undefined) {
			layer = getLayer(name);
		}

		target.type = name;
		target.dynamic = primitiveTypes[name].has("dynamic");


		if (target.container != Entity.container) {
			Entity.container.addChild(target.container);

			target.container.zIndex = layer ?? getLayer(name);
		}
	};
}



export { Entity, type EntityTypes, type GetEntityInstanceType, defineCustomType };