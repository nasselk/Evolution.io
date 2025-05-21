import { removeFromArray } from "../../utils/utils";

import { BitSet } from "../../utils/bitset";

import { Entity } from "../entities/entity";



type Constructor<T> = new (...args: any) => T;

type QueryCallback<T, Types> = (objects: Types extends undefined ? T[] : { [K in keyof Types]: Types[K] extends new (...args: any[]) => infer R ? R[] : never }, queryID: number, ...params: any[]) => boolean | void

type PairwiseCallback<T> = (entity1: T, entity2: T) => void;



class HashGrid2D<T extends Entity, Types extends Record<string, Constructor<T>> | undefined = undefined> {
	public static gridCount: number = 0;


	public readonly id: number;
	private readonly cellWidth: number;
	private readonly cellHeight: number;
	private readonly cells: (TypedCell<T, NonNullable<Types>> | UntypedCell<T> | null)[];
	private readonly removableObjects: boolean;
	private readonly checkedPairs: BitSet;
	private readonly maxKeyX: number;
	private readonly maxKeyY: number;
	private readonly typed: boolean;
	private readonly types?: Types;
	private queryID: number;


	public constructor(cellWidth: number, cellHeight: number = cellWidth, maximumX: number, maximumY: number, removableObjects: boolean = true, types?: Types) {
		this.id = HashGrid2D.gridCount++;
		this.cellWidth = cellWidth;
		this.cellHeight = cellHeight;
		this.removableObjects = removableObjects;
		this.maxKeyX = Math.ceil(maximumX / cellWidth);
		this.maxKeyY = Math.ceil(maximumY / cellHeight);
		this.cells = new Array(this.getCellHash(this.maxKeyX, this.maxKeyY) + 1).fill(null);
		this.checkedPairs = new BitSet();
		this.typed = Boolean(types);
		this.types = types;
		this.queryID = 0;
	}


	// Unique numeric hash by cell position
	private getCellHash(x: number, y: number): number {
		return x * (this.maxKeyY + 1) + y;
	}


	// Unique bijective numeric hash by pair of IDs
	private getPairID(a: number, b: number): number {
		if (a > b) {
			[ a, b ] = [ b, a ];
		}

		return (b * (b + 1) / 2) + a;
	}


	// Get the cell by its key and create it if need
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


	public insert(object: T, rangeX: number = object.size.x, rangeY: number = object.size.y, type: string = object.type): void {
		// Find the bounds
		const minX: number = Math.max(Math.floor((object.position.x - rangeX / 2) / this.cellWidth), 0);
		const minY: number = Math.max(Math.floor((object.position.y - rangeY / 2) / this.cellHeight), 0);
		const maxX: number = Math.min(Math.floor((object.position.x + rangeX / 2) / this.cellWidth), this.maxKeyX);
		const maxY: number = Math.min(Math.floor((object.position.y + rangeY / 2) / this.cellHeight), this.maxKeyY);


		// Create the cells keys set if needed
		let cellsKeys: Set<number> | undefined;

		if (this.removableObjects) {
			cellsKeys = object.cellsKeys[this.id];

			if (!cellsKeys) {
				cellsKeys = new Set();

				object.cellsKeys[this.id] = cellsKeys;
			}
		}


		// Loop over all cells
		for (let x = minX; x <= maxX; x++) {
			for (let y = minY; y <= maxY; y++) {
				const key: number = this.getCellHash(x, y); // Compute the hash

				const cell = this.getCell(key);

				if (cell.typed) {
					cell.insert(object, type, cellsKeys);
				}

				else {
					cell.insert(object, cellsKeys);
				}
			}
		}
	}


	public remove(object: T, type: string = object.type): void {
		const cellsKeys: Set<number> = object.cellsKeys[this.id];

		// Loop over all cells it's within
		for (const key of cellsKeys) {
			const cell = this.cells[key];

			if (cell) {
				if (cell.typed) {
					cell.remove(object, type, cellsKeys);
				}

				else {
					cell.remove(object, cellsKeys);
				}

				if (cell.count === 0) {
					this.cells[key] = null;
				}
			}
		}
	}


	public move(object: T, rangeX: number = object.size.x, rangeY: number = object.size.y, type: string = object.type): void {
		const minX: number = Math.max(Math.floor((object.position.x - rangeX / 2) / this.cellWidth), 0);
		const minY: number = Math.max(Math.floor((object.position.y - rangeY / 2) / this.cellHeight), 0);
		const maxX: number = Math.min(Math.floor((object.position.x + rangeX / 2) / this.cellWidth), this.maxKeyX);
		const maxY: number = Math.min(Math.floor((object.position.y + rangeY / 2) / this.cellHeight), this.maxKeyY);


		const cellsKeys: Set<number> = object.cellsKeys[this.id];
		const rightKeys: Set<number> = new Set();


		for (let x = minX; x <= maxX; x++) {
			for (let y = minY; y <= maxY; y++) {
				const key: number = this.getCellHash(x, y);

				if (!cellsKeys.has(key)) {
					const cell = this.getCell(key);

					if (cell.typed) {
						cell.insert(object, type, cellsKeys);
					}

					else {
						cell.insert(object, cellsKeys);
					}
				}

				rightKeys.add(key);
			}
		}


		for (const key of cellsKeys) {
			if (!rightKeys.has(key)) {
				const cell = this.cells[key];

				if (cell) {
					if (cell.typed) {
						cell.remove(object, type, cellsKeys);
					}

					else {
						cell.remove(object, cellsKeys);
					}
				}
			}
		}
	}


	// Run the callback for all cell this entity overlaps
	// Callback remove the need of an intermediate insertion array which  reduces performances
	// Make sure to use the queryID to avoid double checking the same entity during the same query
	public query(object: T, callback: QueryCallback<T, Types>, rangeX: number = object.size.x, rangeY: number = object.size.y, ...params: any[]): boolean {
		// Find the bounds
		const minX: number = Math.max(Math.floor((object.position.x - rangeX / 2) / this.cellWidth), 0);
		const minY: number = Math.max(Math.floor((object.position.y - rangeY / 2) / this.cellHeight), 0);
		const maxX: number = Math.min(Math.floor((object.position.x + rangeX / 2) / this.cellWidth), this.maxKeyX);
		const maxY: number = Math.min(Math.floor((object.position.y + rangeY / 2) / this.cellHeight), this.maxKeyY);


		if (this.queryID === Number.MAX_SAFE_INTEGER - 1) {
			this.queryID = 0;
		}

		else {
			this.queryID++;
		}


		// Loop over all cells it overlaps
		for (let x = minX; x <= maxX; x++) {
			for (let y = minY; y <= maxY; y++) {
				const key: number = this.getCellHash(x, y);
				const cell = this.cells[key];

				if (cell) {
					const exit = callback.call(object, cell.objects as any, this.queryID, ...params); // Run the callback

					if (exit) {
						return true;
					}
				}
			}
		}

		return false;
	}


	public pairwiseCombination(callback: PairwiseCallback<T>, minID: number = 0, maxID: number, restrictive: boolean = true): void {
		if (this.typed) {
			throw new Error("Cannot use pairwiseCombination with typed HashGrid2D");
		}

		else {
			if (restrictive) {
				if (maxID - minID > this.checkedPairs.length) {
					const maxPairID: number = this.getPairID(maxID - minID + 50, maxID - minID + 50);

					this.checkedPairs.resize(maxPairID);
				}

				else {
					this.checkedPairs.clear();
				}
			}


			for (const cell of this.cells) {
				if (cell && !cell.typed) {

					for (let i = 0; i < cell.count; i++) {
						const entity1: T = cell.objects[i];

						for (let j = i + 1; j < cell.count; j++) {
							const entity2: T = cell.objects[j];

							if (entity1.spawned && entity2.spawned) {
								const hash: number = this.getPairID(entity1.id - minID, entity2.id - minID);

								if (!restrictive || !this.checkedPairs.hasAndAdd(hash)) {
									callback(entity1, entity2);
								}
							}
						}
					}
				}
			}
		}
	}


	// Empty the grid
	public clear(clean?: Map<number, T>): void {
		this.cells.fill(null);

		if (clean) {
			for (const entity of clean.values()) {
				entity.cellsKeys[this.id].clear();
			}
		}
	}
}



abstract class BaseCell {
	private readonly key: number;
	public count: number;


	public constructor(key: number) {
		this.key = key;
		this.count = 0;
	}


	public add(cellsKeys?: Set<number>): void {
		cellsKeys?.add(this.key);

		this.count++;
	}


	public delete(cellsKeys: Set<number>): void {
		cellsKeys.delete(this.key);

		this.count--;
	}


	public clear(): void {
		this.count = 0;
	}
}



class UntypedCell<T extends Entity> extends BaseCell {
	public readonly typed: false;
	public readonly objects: T[];


	public constructor(key: number) {
		super(key);

		this.typed = false;
		this.objects = [];
	}


	public insert(object: T, cellsKeys?: Set<number>): void {
		this.objects.push(object);

		this.add(cellsKeys);
	}


	public remove(object: T, cellsKeys: Set<number>): void {
		removeFromArray(this.objects, object);

		this.delete(cellsKeys);
	}


	public override clear(): void {
		this.objects.length = 0;

		super.clear();
	}
}



class TypedCell<T extends Entity, Types extends Record<string, Constructor<T>>> extends BaseCell {
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


	public insert(object: T, type: keyof Types, cellsKeys?: Set<number>): void {
		this.objects[type].push(object as InstanceType<Types[typeof type]>);

		this.add(cellsKeys);
	}


	public remove(object: T, type: keyof Types, cellsKeys: Set<number>): void {
		removeFromArray(this.objects[type], object);

		this.delete(cellsKeys);
	}


	public override clear(): void {
		for (const key in this.objects) {
			this.objects[key].length = 0;
		}

		super.clear();
	}
}



export { HashGrid2D, type QueryCallback, type PairwiseCallback };