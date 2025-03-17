class BitSet {
	private bits: Uint8Array;
	public length: number;

	
	public constructor(maximum: number = 0) {
		this.bits = new Uint8Array((maximum + 7) >> 3);
		this.length = maximum;
	}


	public *[Symbol.iterator](): IterableIterator<number> {
		for (let i = 0; i < this.length; i++) {
			if (this.has(i)) {
				yield i;
			}
		}
	}


	public forEach(callback: (value: number, index?: number) => void): void {
    	let i = 0;

    	for (const value of this) {
        	callback(value, i);
			
        	i++;
    	}
	}


	public add(value: number): void {
		const index = value >> 3;
		const bit = value & 7;

		this.bits[index] |= (1 << bit);
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
		const bits = new Uint8Array((max + 7) >> 3);

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