class MsgWriter {
	private static readonly textEncoder = new TextEncoder();

	private readonly resizable: boolean;
	private view: DataView;
	private lastFlagIndex: number;
	private flagOffset: number;
	private buffer: Uint8Array;
	private offset: number;

	
	public constructor(allocation: number | ArrayBufferLike, resizeable: boolean = false) {
		if (typeof allocation === "number") {
			this.buffer = new Uint8Array(allocation);
		}

		else {
			this.buffer = new Uint8Array(allocation);
		}

		this.view = new DataView(this.buffer.buffer);
		this.resizable = resizeable;
		this.lastFlagIndex = 0;
		this.flagOffset = 0;
		this.offset = 0;
	}


	public static textBuffer(text: string): Uint8Array {
		const buffer = MsgWriter.textEncoder.encode(text);

		return buffer;
	}


	public static toPrecision(value: number, maximum: number, bits: number, safetyOffset: number = 1000) {
		const bound = 2 ** bits - 1;

		return Math.round(value * bound / (maximum + safetyOffset));
	}
	

	public writeBit(value: number | boolean, bits: number = 1): void {
		value = +value; // To number

		
		const max = 2 ** bits - 1;

		if (value < 0 || value > max) {
			throw new RangeError(`Value ${ value } is out of range for ${ bits } bits [ 0, ${ max } ]`);
		}


		for (let i: number = 0; i < bits; i++) {
			const bit = (value >> i) & 1;

			if (this.lastFlagIndex === 0) {
				this.flagOffset = this.offset;

				this.writeUint8(bit);
			}

			else {
				let currentByte: number = this.view.getUint8(this.flagOffset);

				currentByte |= bit << this.lastFlagIndex;

				this.writeUint8(currentByte, this.flagOffset);
			}

			this.lastFlagIndex = (this.lastFlagIndex + 1) % 8;
		}
	}


	public writeUint8(value: number, offset: number = this.offset): void {
		if (this.resizable && offset === this.buffer.byteLength) {
			this.expand(1);
		}

		this.view.setUint8(offset, value);

		if (offset === this.offset) {
			this.offset++;
		}
	}


	public writeInt8(value: number, offset: number = this.offset): void {
		if (this.resizable && offset === this.buffer.byteLength) {
			this.expand(1);
		}

		this.view.setInt8(offset, value);

		if (offset === this.offset) {
			this.offset++;
		}
	}


	public writeUint16(value: number, offset: number = this.offset): void {
		if (this.resizable && offset === this.buffer.byteLength) {
			this.expand(2);
		}

		this.view.setUint16(offset, value, true);

		if (offset === this.offset) {
			this.offset += 2;
		}
	}


	public writeInt16(value: number, offset: number = this.offset): void {
		if (this.resizable && offset === this.buffer.byteLength) {
			this.expand(2);
		}

		this.view.setInt16(offset, value, true);

		if (offset === this.offset) {
			this.offset += 2;
		}
	}


	public writeUint32(value: number, offset: number = this.offset): void {
		if (this.resizable && offset === this.buffer.byteLength) {
			this.expand(4);
		}

		this.view.setUint32(offset, value, true);

		if (offset === this.offset) {
			this.offset += 4;
		}
	}

	
	public writeInt32(value: number, offset: number = this.offset): void {
		if (this.resizable && offset === this.buffer.byteLength) {
			this.expand(4);
		}

		this.view.setInt32(offset, value, true);

		if (offset === this.offset) {
			this.offset += 4;
		}
	}


	public writeFloat32(value: number, offset: number = this.offset): void {
		if (this.resizable && offset === this.buffer.byteLength) {
			this.expand(4);
		}

		this.view.setFloat32(offset, value, true);

		if (offset === this.offset) {
			this.offset += 4;
		}
	}


	public writeUint64(value: bigint, offset: number = this.offset): void {
		if (this.resizable && offset === this.buffer.byteLength) {
			this.expand(8);
		}

		this.view.setBigUint64(offset, value, true);

		if (offset === this.offset) {
			this.offset += 8;
		}
	}


	public writeInt64(value: bigint, offset: number = this.offset): void {
		if (this.resizable && offset === this.buffer.byteLength) {
			this.expand(8);
		}

		this.view.setBigInt64(offset, value, true);

		if (offset === this.offset) {
			this.offset += 8;
		}
	}


	public writeFloat64(value: number, offset: number = this.offset): void {
		if (this.resizable && offset === this.buffer.byteLength) {
			this.expand(8);
		}

		this.view.setFloat64(offset, value, true);

		if (offset === this.offset) {
			this.offset += 8;
		}
	}


	public writeText(text: string, includeSize: boolean = false, offset: number = this.offset): void {
		const buffer = MsgWriter.textBuffer(text);

		let additionalOffset = 0;

		if (includeSize) {
			this.writeUint16(buffer.byteLength, offset);

			additionalOffset = 2;
		}

		this.writeBuffer(buffer, offset + additionalOffset);
	}


	public writeBuffer(buffer: ArrayLike<number>, offset: number = this.offset): void {
		if (this.resizable && offset === this.buffer.byteLength) {
			this.expand(buffer.length);
		}

		this.buffer.set(buffer, this.offset);

		if (offset === this.offset) {
			this.offset += buffer.length;
		}
	}


	public expand(add: number): void {
		const buffer = this.buffer;

		this.buffer = new Uint8Array(buffer.byteLength + add);

		this.view = new DataView(this.buffer.buffer);

		this.writeBuffer(buffer, 0);
	}


	public shrink(remove: number): void {
		const buffer = this.buffer;

		this.buffer = new Uint8Array(buffer.buffer, 0, buffer.byteLength - remove);

		this.view = new DataView(this.buffer.buffer);
	}


	public reset(offset: number = 0): void {
		this.offset = offset;
		this.lastFlagIndex = 0;
		this.flagOffset = 0;
	}


	public get bytes(): Uint8Array {
		if (this.offset !== this.buffer.byteLength) {
			console.trace("Buffer not filled", this.offset, this.buffer.byteLength);
		}

		return this.buffer;
	}
}



export { MsgWriter };