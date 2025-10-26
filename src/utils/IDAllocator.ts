class IDAllocator {
	private readonly freePositiveIDs: number[];
	private readonly freeNegativeIDs: number[];
	private nextPositiveID: number;
	private nextNegativeID: number;

	constructor() {
		this.freePositiveIDs = [];
		this.freeNegativeIDs = [];
		this.nextPositiveID = 1;
		this.nextNegativeID = -1;
	}

	// Allocate a positive numeric ID
	public allocate(): number {
		if (this.freePositiveIDs.length > 0) {
			return this.freePositiveIDs.pop()!; // Retrieve from the pool
		} else {
			return this.nextPositiveID++;
		}
	}

	// Allocate a negative numeric ID
	public allocateNegative(): number {
		if (this.freeNegativeIDs.length > 0) {
			return this.freeNegativeIDs.pop()!; // Retrieve from the pool
		} else {
			return this.nextNegativeID--;
		}
	}

	// Free a set of numeric IDs
	public free(...ids: number[]): void {
		for (const id of ids) {
			if (id > 0) {
				if (id < this.nextPositiveID) {
					this.freePositiveIDs.push(id);
				}
			} else {
				if (id > this.nextNegativeID) {
					this.freeNegativeIDs.push(id);
				}
			}
		}
	}
}

export { IDAllocator };
