import { removeFromArray } from "../../utils/utils";

import { Entity } from "../entities/entity";



type Constructor<T> = new (...args: any) => T;

type QueryCallback<T, Types> = (objects: Types extends undefined ? T[] : { [K in keyof Types]: Types[K] extends new (...args: any[]) => infer R ? R[] : never }, queryID: number, ...params: any[]) => boolean | void

type PairwiseCallback<T> = (entity1: T, entity2: T) => void;




class LiteHashGrid2D<T extends Entity, Types extends Record<string, Constructor<T>> | undefined = undefined> {
	public static gridCount: number = 0;


	public readonly id: number;
	private readonly cellWidth: number;
	private readonly cellHeight: number;
	private readonly cells: (TypedCell<T, NonNullable<Types>> | UntypedCell<T> | null)[];
	private readonly maxKeyX: number;
	private readonly maxKeyY: number;
	private readonly typed: boolean;
	private readonly types?: Types;
	private queryID: number;


	public constructor(cellWidth: number, cellHeight: number = cellWidth, maximumX: number, maximumY: number, types?: Types) {
		this.id = LiteHashGrid2D.gridCount++;
		this.cellWidth = cellWidth;
		this.cellHeight = cellHeight;
		this.maxKeyX = Math.ceil(maximumX / cellWidth);
		this.maxKeyY = Math.ceil(maximumY / cellHeight);
		this.cells = new Array(this.getCellHash(this.maxKeyX, this.maxKeyY) + 1).fill(null);
		this.typed = Boolean(types);
		this.types = types;
		this.queryID = 0;
	}


	private getCellHash(x: number, y: number): number {
		return x * (this.maxKeyY + 1) + y;
	}

	private getCell(key: number): TypedCell<T, NonNullable<Types>> | UntypedCell<T> {
		let cell = this.cells[key];

		if (!cell) {
			if (this.typed) {
				cell = new TypedCell<T, NonNullable<Types>>(key, this.types!);
			}

			else {
				cell = new UntypedCell<T>(key);
			}

			this.cells[key] = cell;
		}

		return cell;
	}


	public insert(object: T, type: string = object.type): void {
		const x: number = Math.min(Math.max(Math.floor(object.position.x / this.cellWidth), 0), this.maxKeyX);
		const y: number = Math.min(Math.max(Math.floor(object.position.y / this.cellHeight), 0), this.maxKeyY);

		const key: number = this.getCellHash(x, y);

		const cell = this.getCell(key);

		if (cell.typed) {
			cell.insert(object, type);
		}

		else {
			cell.insert(object);
		}
	}


	public remove(object: T, type: string = object.type): void {
		const cell = object.cell;

		if (cell.typed) {
			cell.remove(object, type);
		}

		else {
			cell.remove(object);
		}

		if (cell.count === 0) {
			this.cells[cell.key] = null;
		}
	}


	public move(object: T, type: string = object.type): void {
		const x: number = Math.min(Math.max(Math.floor(object.position.x / this.cellWidth), 0), this.maxKeyX);
		const y: number = Math.min(Math.max(Math.floor(object.position.y / this.cellHeight), 0), this.maxKeyY);


		const oldKey = object.cell.key;
		const key: number = this.getCellHash(x, y);


		if (oldKey != key) {
			const oldCell = this.getCell(oldKey);

			if (oldCell) {
				if (oldCell.typed) {
					oldCell.remove(object, type);
				}

				else {
					oldCell.remove(object);
				}
			}


			const cell = this.getCell(key);

			if (cell.typed) {
				cell.insert(object, type);
			}

			else {
				cell.insert(object);
			}
		}
	}


	public query(object: T, callback: QueryCallback<T, Types>, ...params: any[]): boolean {
		if (this.queryID === Number.MAX_SAFE_INTEGER - 1) {
			this.queryID = 0;
		}

		else {
			this.queryID++;
		}

		const cell = object.cell;

		if (cell) {
			const exit = callback.call(object, cell.objects as any, this.queryID, ...params);

			if (exit) {
				return true;
			}
		}

		return false;
	}


	public pairwiseCombination(callback: PairwiseCallback<T>): void {
		if (this.typed) {
			throw new Error("Cannot use pairwiseCombination with typed HashGrid2D");
		}

		else {
			for (const cell of this.cells) {
				if (cell && !cell.typed) {

					for (let i = 0; i < cell.count; i++) {
						const entity1: T = cell.objects[i];

						for (let j = i + 1; j < cell.count; j++) {
							const entity2: T = cell.objects[j];

							if (entity1.spawned && entity2.spawned) {
								callback(entity1, entity2);
							}
						}
					}
				}
			}
		}
	}


	public clear(clean?: Map<number, T>): void {
		this.cells.fill(null);

		if (clean) {
			for (const entity of clean.values()) {
				entity.cell = null;
			}
		}
	}
}



abstract class BaseCell<T extends Entity> {
	public readonly key: number;
	public count: number;


	public constructor(key: number) {
		this.key = key;
		this.count = 0;
	}


	public add(object: T): void {
		object.cell = this;
		object.cellIndex = this.count - 1;

		this.count++;
	}


	public delete(object: T): void {
		object.cell = null;
		object.cellIndex = null;

		this.count--;
	}


	public clear(): void {
		this.count = 0;
	}
}



class UntypedCell<T extends Entity> extends BaseCell<T> {
	public readonly typed: false;
	public readonly objects: T[];


	public constructor(key: number) {
		super(key);

		this.typed = false;
		this.objects = [];
	}


	public insert(object: T): void {
		this.objects.push(object);

		this.add(object);
	}


	public remove(object: T): void {
		removeFromArray(this.objects, object, object.cellIndex);

		this.delete(object);
	}


	public override clear(): void {
		this.objects.length = 0;

		super.clear();
	}
}



class TypedCell<T extends Entity, Types extends Record<string, Constructor<T>>> extends BaseCell<T> {
	public readonly objects: { [K in keyof Types]: InstanceType<Types[K]>[] };
	public readonly typed = true;


	public constructor(key: number, types: Types) {
		super(key);

		this.objects = {} as any;
		this.typed = true;

		for (const type in types) {
			this.objects[type] = [];
		}
	}


	public insert(object: T, type: keyof Types): void {
		this.objects[type].push(object as InstanceType<Types[typeof type]>);

		this.add(object);
	}


	public remove(object: T, type: keyof Types): void {
		removeFromArray(this.objects[type], object);

		this.delete(object);
	}


	public override clear(): void {
		for (const key in this.objects) {
			this.objects[key].length = 0;
		}

		super.clear();
	}
}



export { LiteHashGrid2D, type QueryCallback, type PairwiseCallback };