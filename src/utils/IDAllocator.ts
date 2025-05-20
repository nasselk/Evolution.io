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


	public allocate(): number {
		if (this.freePositiveIDs.length > 0) {
			return this.freePositiveIDs.pop()!;
		}

		else {
			return this.nextPositiveID++;
		}
	}


	public allocateNegative(): number {
		if (this.freeNegativeIDs.length > 0) {
			return this.freeNegativeIDs.pop()!;
		}

		else {
			return this.nextNegativeID--;
		}
	}


	public free(...ids: number[]): void {
		for (const id of ids) {
			if (id > 0) {
				if (id < this.nextPositiveID) {
					this.freePositiveIDs.push(id);
				}
			}

			else {
				if (id > this.nextNegativeID) {
					this.freeNegativeIDs.push(id);
				}
			}
		}
	}
}


export { IDAllocator };