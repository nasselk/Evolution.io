import { interpolate, interpolateAngle } from "../../math/interpolation";

import { EntitiesConfig } from "../../shared/entities/properties";

import { newContainer } from "../../rendering/createVisuals";

import { type Entities } from "../../shared/entities/types";

import { currentTool, Tools } from "../../UI/stores/tool";

import { ThreadEvents } from "../../shared/thread/events";

import { BufferReader } from "../../shared/thread/reader";

import { getLayer } from "../../rendering/core/layers";

import { worldContainer } from "../core/renderer";

import { Timer } from "../../utils/timers/timer";

import { Vector } from "../../math/vector";

import { Container } from "pixi.js";

import Game from "../../game";

type EntityTypes = keyof typeof Entities;
type GetEntityInstanceType<T extends EntityTypes> = InstanceType<(typeof Game.classes)[T]>;

// Global entity class being used by all entities
abstract class Entity<T extends EntityTypes = EntityTypes> {
	public static readonly list: Map<number, Entity> = new Map();
	public static readonly container: Container = worldContainer;
	public static dynamic: boolean;
	public static type: EntityTypes;

	public readonly id: number;
	public readonly position: Vector;
	public readonly target: { readonly position: Vector; angle: number; readonly size: Vector; opacity: number };
	protected readonly interpolation: typeof Game.settings.interpolation;
	protected readonly size: Vector;
	protected animationSpeed: number;
	protected container: Container;
	protected lastUpdate: number;
	protected initiated: boolean;
	private visibleScale: number;
	protected creation: number;
	protected spawned: boolean;
	protected angle: number;
	public readonly type: T;
	protected abstract init(): void;
	declare ["constructor"]: typeof Entity;

	protected constructor(id: number, properties: BufferReader) {
		this.id = id;
		this.angle = 0;
		this.position = new Vector();
		this.target = { position: this.position.clone, angle: this.angle, size: new Vector(), opacity: 1 };
		this.interpolation = Game.settings.interpolation;
		this.type = this.constructor.type as T;
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

		this.update(properties);

		this.engineInteraction();

		this.position.set(this.target.position);
	}

	public static create<T extends EntityTypes>(type: T, ...args: ConstructorParameters<(typeof Game.classes)[T]>): InstanceType<(typeof Game.classes)[T]> {
		const constructor = Game.classes[type] as any;

		const entity = new constructor(...args);

		Entity.get(entity.id)?.destroy(true); // Cleanup if entity with this id already exists

		// Save a reference in maps
		Entity.list.set(entity.id, entity);

		entity.constructor.list.set(entity.id, entity);

		return entity;
	}

	public static has<T extends EntityTypes>(id: number, type?: T): boolean {
		const entity = Entity.get<T>(id);

		return Boolean(entity && (!type || entity.type === type));
	}

	public static get<T extends EntityTypes | undefined>(id: number): (T extends EntityTypes ? InstanceType<(typeof Game.classes)[T]> : Entity) | undefined {
		return Entity.list.get(id) as ReturnType<typeof this.get<T>>;
	}

	public render(deltaTime: number): boolean | void {
		if (this.constructor.dynamic) {
			this.position.x = interpolate(this.position.x, this.target.position.x, this.interpolation.moves, deltaTime);
			this.position.y = interpolate(this.position.y, this.target.position.y, this.interpolation.moves, deltaTime);
			this.angle = interpolateAngle(this.angle, this.target.angle, this.interpolation.angle, deltaTime);
		}

		this.size.x = interpolate(this.size.x, this.target.size.x, this.animationSpeed, deltaTime, 1);
		this.size.y = interpolate(this.size.y, this.target.size.y, this.animationSpeed, deltaTime, 1);

		return (this.container.visible = !this.remove() && this.renderable); // this.remove() returns true if the entity is removed (one of size axis being 0 and not spawned anymore)
	}

	public update(buffer: BufferReader): this {
		const x = buffer.readUint16();
		const y = buffer.readUint16();
		const angle = buffer.readUint8();
		const size = buffer.readUint16();

		this.target.position.set(BufferReader.fromPrecision(x, Game.map.bounds.max.x, 16), BufferReader.fromPrecision(y, Game.map.bounds.max.y, 16));
		this.target.angle = BufferReader.fromPrecision(angle, 2 * Math.PI, 8);
		this.target.size.set(size);

		return this;
	}

	public destroy(immediate: boolean = false): void {
		for (const value of Object.values(this)) {
			if (value instanceof Timer) {
				value.clear();
			}
		}

		if (!immediate && this.isVisible()) {
			this.target.size.x = 0;
			this.target.size.y = 0;

			this.animationSpeed = 0.1;
		} else {
			this.remove(true);
		}

		this.spawned = false;
	}

	protected remove(force: boolean = false): boolean {
		if (force || ((this.size.x === 0 || this.size.y === 0) && !this.spawned)) {
			Entity.list.delete(this.id);

			Game.classes[this.type].list.delete(this.id);

			this.cleanup();

			return true;
		} else {
			return false;
		}
	}

	private cleanup(): void {
		for (const key in this) {
			if (this[key] instanceof Timer) {
				this[key].clear();
			} else if (this[key] instanceof Container) {
				this[key].destroy({ children: true /*, context: true*/ });
			}

			delete this[key];
		}
	}

	private isVisible(scale: number = this.visibleScale): boolean {
		const position = Game.camera.toLocalPoint(this.position);

		let width = this.size.x * Game.camera.zoom * scale;
		let height = this.size.y * Game.camera.zoom * scale;

		if (this.angle != 0) {
			width *= Math.SQRT2;
			height *= Math.SQRT2;
		}

		return !document.hidden && width > 0 && height > 0 && position.x + width / 2 > 0 && position.x - width / 2 < Game.renderer.canvas.width && position.y + height / 2 > 0 && position.y - height / 2 < Game.renderer.canvas.height;
	}

	private engineInteraction() {
		const dragOffset = new Vector(0, 0);

		const drag = (event: PointerEvent) => {
			const position = Game.camera.toGlobalPoint(event.clientX * devicePixelRatio * Game.renderer.resolution, event.clientY * devicePixelRatio * Game.renderer.resolution);

			position.add(dragOffset);

			Game.simulation?.send(ThreadEvents.MOVE, {
				id: this.id,
				x: position.x,
				y: position.y,
			});
		};

		this.container.on("pointerdown", (event) => {
			if (event.button === 0) {
				switch (currentTool) {
					case Tools.Destroy: {
						Game.simulation?.send(ThreadEvents.DESTROY, this.id);

						break;
					}

					case Tools.Move: {
						const position = Game.camera.toGlobalPoint(event.clientX * devicePixelRatio * Game.renderer.resolution, event.clientY * devicePixelRatio * Game.renderer.resolution);

						dragOffset.set(this.position.clone.subtract(position));

						window.addEventListener("pointermove", drag);

						window.addEventListener(
							"pointerup",
							() => {
								window.removeEventListener("pointermove", drag);
							},
							{ once: true },
						);

						break;
					}
				}
			}
		});
	}

	private get renderable(): boolean {
		return this.initiated && this.isVisible();
	}
}

function defineCustomType(name: EntityTypes, layer?: number) {
	return function <T extends typeof Entity<EntityTypes>>(target: T) {
		if (layer === undefined) {
			layer = getLayer(name);
		}

		target.type = name;

		const properties = EntitiesConfig[name];

		if (properties) {
			target.dynamic = properties.dynamic;
		} else {
			throw new Error(`Entity ${name} not found in EntitiesConfig`);
		}

		if (target.container != Entity.container) {
			Entity.container.addChild(target.container);

			target.container.zIndex = layer ?? getLayer(name);
		}
	};
}

export { Entity, type EntityTypes, type GetEntityInstanceType, defineCustomType };
