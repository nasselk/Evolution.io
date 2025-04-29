import { createBuffer } from "./buffer";



class BufferWriter {
	private static readonly textEncoder = new TextEncoder();

	private readonly resizable: boolean;
	private readonly byteLength: number;
	private lastBitOffset: number;
	private lastBitIndex: number;
	public buffer: Uint8Array;
	private view: DataView;
	private offset: number;


	public constructor(byteLength?: number, resizable?: boolean);
	public constructor(buffer: ArrayBufferLike | ArrayBufferView | Buffer | BufferWriter, resizable?: boolean, clone?: boolean);
	public constructor(allocation: number | ArrayBufferLike | ArrayBufferView | Buffer | BufferWriter = 0, resizable: boolean = allocation === 0, clone: boolean = false) {
		this.buffer = createBuffer(allocation, clone);

		this.view = new DataView(this.buffer.buffer);
		this.byteLength = this.buffer.byteLength;
		this.resizable = resizable;
		this.lastBitOffset = 0;
		this.lastBitIndex = 0;
		this.offset = 0;
	}


	public static textBuffer(text: string): Uint8Array {
		const buffer = BufferWriter.textEncoder.encode(text);

		return buffer;
	}


	public static toPrecision(value: number, maximum: number, bits: number, safetyOffset: number = 1000): number {
		const bound = 2 ** bits - 1;

		return Math.round(value * bound / (maximum + safetyOffset));
	}


	public static stringByteLength(text: string): number {
		return BufferWriter.textEncoder.encode(text).length;
	}


	public writeBits(value: number | boolean, bits: number = 1, signed: boolean = false): void {
		value = +value; // To number


		const min = signed ? -(2 ** (bits - 1)) : 0;
		const max = signed ? (2 ** (bits - 1)) - 1 : (2 ** bits) - 1;

		if (value < min || value > max) {
			throw new RangeError(`Value ${value} is out of range for ${bits} bits [${min}, ${max}]`);
		}

		if (signed) {
			value -= min;
		}


		for (let i: number = 0; i < bits; i++) {
			const bit = (value >> i) & 1;

			if (this.lastBitIndex === 0) {
				this.lastBitOffset = this.offset;

				this.writeUint8(bit);
			}

			else {
				let currentByte: number = this.view.getUint8(this.lastBitOffset);

				currentByte |= bit << this.lastBitIndex;

				this.writeUint8(currentByte, this.lastBitOffset);
			}

			this.lastBitIndex = (this.lastBitIndex + 1) % 8;
		}
	}


	public writeUint8(value: number, offset: number = this.offset): void {
		if (this.resizable && offset === this.byteLength) {
			this.expand(1);
		}

		this.view.setUint8(offset, value);

		if (offset === this.offset) {
			this.offset++;
		}
	}


	public writeInt8(value: number, offset: number = this.offset): void {
		if (this.resizable && offset === this.byteLength) {
			this.expand(1);
		}

		this.view.setInt8(offset, value);

		if (offset === this.offset) {
			this.offset++;
		}
	}


	public writeUint16(value: number, offset: number = this.offset): void {
		if (this.resizable && offset === this.byteLength) {
			this.expand(2);
		}

		this.view.setUint16(offset, value, true);

		if (offset === this.offset) {
			this.offset += 2;
		}
	}


	public writeInt16(value: number, offset: number = this.offset): void {
		if (this.resizable && offset === this.byteLength) {
			this.expand(2);
		}

		this.view.setInt16(offset, value, true);

		if (offset === this.offset) {
			this.offset += 2;
		}
	}


	public writeUint32(value: number, offset: number = this.offset): void {
		if (this.resizable && offset === this.byteLength) {
			this.expand(4);
		}

		this.view.setUint32(offset, value, true);

		if (offset === this.offset) {
			this.offset += 4;
		}
	}


	public writeInt32(value: number, offset: number = this.offset): void {
		if (this.resizable && offset === this.byteLength) {
			this.expand(4);
		}

		this.view.setInt32(offset, value, true);

		if (offset === this.offset) {
			this.offset += 4;
		}
	}


	public writeFloat32(value: number, offset: number = this.offset): void {
		if (this.resizable && offset === this.byteLength) {
			this.expand(4);
		}

		this.view.setFloat32(offset, value, true);

		if (offset === this.offset) {
			this.offset += 4;
		}
	}


	public writeUint64(value: bigint, offset: number = this.offset): void {
		if (this.resizable && offset === this.byteLength) {
			this.expand(8);
		}

		this.view.setBigUint64(offset, value, true);

		if (offset === this.offset) {
			this.offset += 8;
		}
	}


	public writeInt64(value: bigint, offset: number = this.offset): void {
		if (this.resizable && offset === this.byteLength) {
			this.expand(8);
		}

		this.view.setBigInt64(offset, value, true);

		if (offset === this.offset) {
			this.offset += 8;
		}
	}


	public writeFloat64(value: number, offset: number = this.offset): void {
		if (this.resizable && offset === this.byteLength) {
			this.expand(8);
		}

		this.view.setFloat64(offset, value, true);

		if (offset === this.offset) {
			this.offset += 8;
		}
	}


	public writeText(text: string, includeSize: boolean = false, offset: number = this.offset): void {
		const buffer = BufferWriter.textBuffer(text);

		if (includeSize) {
			this.writeUint16(buffer.byteLength, offset);

			offset += 2;
		}

		this.writeBuffer(buffer, offset);
	}


	public writeBuffer(buffer: ArrayLike<number>, offset: number = this.offset): void {
		if (this.resizable && offset === this.byteLength) {
			this.expand(buffer.length);
		}

		this.buffer.set(buffer, this.offset);

		if (offset === this.offset) {
			this.offset += buffer.length;
		}
	}


	public expand(add: number = 1): void {
		const buffer = this.buffer;

		this.buffer = new Uint8Array(buffer.byteLength + add);

		this.view = new DataView(this.buffer.buffer);

		this.writeBuffer(buffer, 0);
	}


	public shrink(remove: number = this.byteLength - this.offset): void {
		const buffer = this.buffer;

		this.buffer = new Uint8Array(buffer.buffer, 0, buffer.byteLength - remove);

		this.view = new DataView(this.buffer.buffer);
	}


	public reset(offset: number = 0): void {
		this.offset = offset;
		this.lastBitIndex = 0;
		this.lastBitOffset = 0;
	}


	public get bytes(): Uint8Array {
		if (this.offset < this.byteLength) {
			throw new Error(`Buffer not filled ${this.offset} ${this.byteLength}`);
		}

		return this.buffer;
	}
}



export { BufferWriter };