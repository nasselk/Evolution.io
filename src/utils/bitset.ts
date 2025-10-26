import { createBuffer, type Buffers } from "../shared/thread/buffer";

class BitSet {
	private bits: Uint8Array;
	public length: number;

	public constructor(size?: number);
	public constructor(buffer: Buffers, clone?: boolean);
	public constructor(allocation: number | Buffers = 0, clone: boolean = false) {
		if (typeof allocation === "number") {
			this.bits = createBuffer((allocation + 7) >> 3);
		} else {
			this.bits = createBuffer(allocation, clone);
		}

		this.length = this.bits.byteLength * 8;
	}

	// Iterable methods
	public *[Symbol.iterator](): IterableIterator<number> {
		for (let i = 0; i < this.length; i++) {
			if (this.has(i)) {
				yield i;
			}
		}
	}

	public forEach(callback: (value: number, index: number) => void): void {
		let i = 0;

		for (const value of this) {
			callback(value, i);

			i++;
		}
	}

	public add(value: number): void {
		const index = value >> 3;
		const bit = value & 7;

		this.bits[index] |= 1 << bit;
	}

	public get(value: number): number {
		return this.has(value);
	}

	public has(value: number): number {
		const index = value >> 3;

		const bit = value & 7;

		return this.bits[index] & (1 << bit);
	}

	public hasAndAdd(value: number): number {
		const index = value >> 3;
		const bit = value & 7;

		const mask = 1 << bit;
		const had = this.bits[index] & mask;

		if (!had) {
			this.bits[index] |= mask;
		}

		return had;
	}

	public delete(value: number): void {
		const index = value >> 3;
		const bit = value & 7;

		this.bits[index] &= ~(1 << bit);
	}

	public resize(max: number, recover: boolean = false): void {
		const bits = createBuffer((max + 7) >> 3);

		this.length = max;

		if (recover) {
			for (let i = 0; i < this.bits.length; i++) {
				bits[i] = this.bits[i];
			}
		}

		this.bits = bits;
	}

	public clear(): void {
		this.bits.fill(0);
	}
}

export { BitSet };
