import { createBuffer, type Buffers } from "./buffer.js";

import { clamp } from "../../utils/math/global.js";



class BufferWriter {
	public static readonly textEncoder = new TextEncoder();

	private readonly resizable: boolean;
	private byteLength: number;
	private lastBitOffset: number;
	private lastBitIndex: number;
	public buffer: Uint8Array;
	private view: DataView;
	private offset: number;


	public constructor(byteLength?: number, resizable?: boolean);
	public constructor(buffer: Buffers, resizable?: boolean, clone?: boolean, offset?: number);
	public constructor(allocation: number | Buffers = 0, resizable: boolean = allocation === 0, clone: boolean = false, offset: number = 0) {
		this.buffer = createBuffer(allocation, clone, offset);


		this.view = new DataView(this.buffer.buffer, this.buffer.byteOffset, this.buffer.byteLength);
		this.byteLength = this.view.byteLength;
		this.resizable = resizable;
		this.lastBitOffset = 0;
		this.lastBitIndex = 0;
		this.offset = 0;
	}


	public static rangeMax(bits: number, signed: boolean = false): number {
		if (bits < 1 || bits > 64) {
			throw new RangeError(`Invalid bits ${bits} in [1, 64]`);
		}

		if (signed) {
			return (2 ** (bits - 1)) - 1;
		}

		else {
			return (2 ** bits) - 1;
		}
	}


	public static rangeMin(bits: number, signed: boolean = false): number {
		if (bits < 1 || bits > 64) {
			throw new RangeError(`Invalid bits ${bits} in [1, 64]`);
		}

		if (signed) {
			return -(2 ** (bits - 1));
		}

		else {
			return 0;
		}
	}


	public static toPrecision(value: number, maximum: number, bits: number, signed: boolean = false, minimum: number = signed ? -maximum : 0): number {
		if (maximum === minimum) return 0;

		const bound = BufferWriter.rangeMax(bits, signed);

		if (value < minimum || value > maximum) {
			value = clamp(value, minimum, maximum);
		}

		return Math.round((value - minimum) / (maximum - minimum) * bound);
	}


	public static stringByteLength(text: string): number {
		return BufferWriter.textEncoder.encode(text).length;
	}


	public static textBuffer(text: string): Uint8Array {
		const buffer = BufferWriter.textEncoder.encode(text);

		return buffer;
	}


	public writeBits(value: number | boolean, bits: number = 1, signed: boolean = false): this {
		value = +value; // To number


		const min = BufferWriter.rangeMin(bits, signed);
		const max = BufferWriter.rangeMax(bits, signed);

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


		return this;
	}


	public writeUint8(value: number, offset: number = this.offset): this {
		this.ensureCapacity(1, offset);

		this.view.setUint8(offset, value);

		this.advance(1, offset);

		return this;
	}


	public writeInt8(value: number, offset: number = this.offset): this {
		this.ensureCapacity(1, offset);

		this.view.setInt8(offset, value);

		this.advance(1, offset);

		return this;
	}


	public writeUint16(value: number, offset: number = this.offset): this {
		this.ensureCapacity(2, offset);

		this.view.setUint16(offset, value, true);

		this.advance(2, offset);

		return this;
	}


	public writeInt16(value: number, offset: number = this.offset): this {
		this.ensureCapacity(2, offset);

		this.view.setInt16(offset, value, true);

		this.advance(2, offset);

		return this;
	}


	public writeUint32(value: number, offset: number = this.offset): this {
		this.ensureCapacity(4, offset);

		this.view.setUint32(offset, value, true);

		this.advance(4, offset);

		return this;
	}


	public writeInt32(value: number, offset: number = this.offset): this {
		this.ensureCapacity(4, offset);

		this.view.setInt32(offset, value, true);

		this.advance(4, offset);

		return this;
	}


	public writeFloat32(value: number, offset: number = this.offset): this {
		this.ensureCapacity(4, offset);

		this.view.setFloat32(offset, value, true);

		this.advance(4, offset);

		return this;
	}


	public writeInt64(value: bigint, offset: number = this.offset): this {
		this.ensureCapacity(8, offset);

		this.view.setBigInt64(offset, value, true);

		this.advance(8, offset);

		return this;
	}


	public writeUint64(value: bigint, offset: number = this.offset): this {
		this.ensureCapacity(8, offset);

		this.view.setBigUint64(offset, value, true);

		this.advance(8, offset);

		return this;
	}


	public writeDouble64(value: number, offset: number = this.offset): this {
		this.ensureCapacity(8, offset);

		this.view.setFloat64(offset, value, true);

		this.advance(8, offset);

		return this;
	}


	public writeBuffer(buffer: ArrayLike<number>, includeSize: boolean = false, offset: number = this.offset): this {
		if (includeSize) {
			this.writeUint16(buffer.length, offset);

			offset += 2;
		}

		this.ensureCapacity(buffer.length, offset);

		this.buffer.set(buffer, offset);

		this.advance(buffer.length, offset);

		return this;
	}


	public writeText(text: string, includeSize: boolean = false, offset: number = this.offset): this {
		const buffer = BufferWriter.textBuffer(text);

		return this.writeBuffer(buffer, includeSize, offset);
	}


	public expand(bytes: number = 1): number {
		const buffer = this.buffer;

		this.buffer = createBuffer(this.byteLength + bytes, false, 0);
		this.view = new DataView(this.buffer.buffer);
		this.byteLength = this.buffer.byteLength;

		this.writeBuffer(buffer, false, 0);

		return this.byteLength;
	}


	public shrink(bytes: number = this.byteLength - this.offset): number {
		this.buffer = new Uint8Array(this.buffer.buffer, 0, this.byteLength - bytes);
		this.view = new DataView(this.buffer.buffer);
		this.byteLength = this.buffer.byteLength;

		return this.byteLength;
	}


	private ensureCapacity(bytes: number, offset: number): this {
		if (offset + bytes > this.byteLength) {
			if (this.resizable) {
				this.expand(offset + bytes - this.offset);
			}

			else {
				throw new RangeError(`Buffer overflow ${offset + bytes} ${this.byteLength}`);
			}
		}

		return this;
	}


	private advance(bytes: number = 1, offset: number = this.offset): this {
		if (offset === this.offset) {
			this.offset += bytes;
		}

		return this;
	}


	public reset(offset: number = 0): this {
		this.offset = offset;
		this.lastBitIndex = 0;
		this.lastBitOffset = 0;

		return this;
	}


	public hasSpace(bytes: number = 1): boolean {
		return this.remainingBytes >= bytes;
	}


	public get remainingBytes(): number {
		return this.byteLength - this.offset;
	}


	public get bytes(): Uint8Array {
		if (this.offset < this.byteLength) {
			throw new Error(`Buffer not filled ${this.offset} ${this.byteLength}`);
		}

		return this.buffer;
	}
}



export { BufferWriter };