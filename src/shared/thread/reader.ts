import { createBuffer, type Buffers } from "./buffer.js";

import { BufferWriter } from "./writer.js";



class BufferReader {
	public static readonly textDecoder = new TextDecoder();

	public readonly buffer: Uint8Array;
	private readonly view: DataView;
	public readonly byteLength: number;
	public lastBitOffset: number;
	public lastBitIndex: number;
	public offset: number;


	public constructor(buffer: Buffers, clone: boolean = false, offset: number = 0) {
		this.buffer = createBuffer(buffer, clone, offset);

		this.view = new DataView(this.buffer.buffer, this.buffer.byteOffset, this.buffer.byteLength);
		this.byteLength = this.view.byteLength;
		this.lastBitOffset = 0;
		this.lastBitIndex = 0;
		this.offset = 0;
	}


	public static fromPrecision(value: number, maximum: number, bits: number, signed: boolean = false, minimum: number = signed ? -maximum : 0): number {
		if (maximum === minimum) return minimum;

		const bound = BufferWriter.rangeMax(bits, signed);

		return (value / bound) * (maximum - minimum) + minimum;
	}


	public static readTextBuffer(buffer: ArrayBuffer): string {
		return BufferReader.textDecoder.decode(buffer);
	}


	public readBits(bits: number = 1, signed: boolean = false, increment: boolean = true): boolean | number {
		let value: number = 0;


		for (let i: number = 0; i < bits; i++) {
			if (this.lastBitIndex === 0) {
				this.lastBitOffset = this.offset;

				this.offset++;
			}

			const flag = this.readUint8(increment, this.lastBitOffset);
			const bit = (flag >> this.lastBitIndex) & 1;

			value |= bit << i;

			if (increment) {
				this.lastBitIndex = (this.lastBitIndex + 1) % 8;
			}
		}


		if (bits === 1) return Boolean(value);

		if (signed) {
			const min = BufferWriter.rangeMin(bits, signed);

			value += min;
		}


		return value;
	}


	public readUint8(increment: boolean = true, offset: number = this.offset): number {
		const value = this.view.getUint8(offset);

		if (increment && offset === this.offset) {
			this.offset++;
		}

		return value;
	}


	public readInt8(increment: boolean = true, offset: number = this.offset): number {
		const value = this.view.getInt8(offset);

		if (increment && offset === this.offset) {
			this.offset++;
		}

		return value;
	}


	public readUint16(increment: boolean = true, offset: number = this.offset): number {
		const value = this.view.getUint16(offset, true);

		if (increment && offset === this.offset) {
			this.offset += 2;
		}

		return value;
	}


	public readInt16(increment: boolean = true, offset: number = this.offset): number {
		const value = this.view.getInt16(offset, true);

		if (increment && offset === this.offset) {
			this.offset += 2;
		}

		return value;
	}


	public readUint32(increment: boolean = true, offset: number = this.offset): number {
		const value = this.view.getUint32(offset, true);

		if (increment && offset === this.offset) {
			this.offset += 4;
		}

		return value;
	}


	public readInt32(increment: boolean = true, offset: number = this.offset): number {
		const value = this.view.getInt32(offset, true);

		if (increment && offset === this.offset) {
			this.offset += 4;
		}

		return value;
	}


	public readFloat32(increment: boolean = true, offset: number = this.offset): number {
		const value = this.view.getFloat32(offset, true);

		if (increment && offset === this.offset) {
			this.offset += 4;
		}

		return value;
	}


	public readUint64(increment: boolean = true, offset: number = this.offset): bigint {
		const value = this.view.getBigUint64(offset, true);

		if (increment && offset === this.offset) {
			this.offset += 8;
		}

		return value;
	}


	public readInt64(increment: boolean = true, offset: number = this.offset): bigint {
		const value = this.view.getBigInt64(offset, true);

		if (increment && offset === this.offset) {
			this.offset += 8;
		}

		return value;
	}


	public readFloat64(increment: boolean = true, offset: number = this.offset): number {
		const value = this.view.getFloat64(offset, true);

		if (increment && offset === this.offset) {
			this.offset += 8;
		}

		return value;
	}


	public readText(includeSize?: boolean, increment?: boolean, offset?: number): string;
	public readText(bytes?: number, increment?: boolean, offset?: number): string;
	public readText(a?: number | boolean, increment: boolean = true, offset: number = this.offset): string {
		const buffer = this.readBuffer(a as any, increment, offset);

		return BufferReader.textDecoder.decode(buffer);
	}


	public readBuffer(includeSize?: boolean, increment?: boolean, offset?: number): Uint8Array;
	public readBuffer(bytes?: number, increment?: boolean, offset?: number): Uint8Array;
	public readBuffer(a?: number | boolean, increment: boolean = true, offset: number = this.offset): Uint8Array {
		let length: number;


		if (a === true) {
			length = this.readUint16(increment, offset);

			offset += 2;
		}

		else {
			length = a || this.buffer.byteLength - this.offset;
		}


		const buffer = this.buffer.slice(offset, offset + length);

		if (increment && offset === this.offset) {
			this.offset += length;
		}

		return buffer;
	}


	private advance(bytes: number = 1, offset: number = this.offset): this {
		if (offset === this.offset) {
			this.offset += bytes;
		}

		return this;
	}


	public reset(offset: number = 0): void {
		this.offset = offset;
		this.lastBitIndex = 0;
		this.lastBitOffset = 0;
	}


	public hasSpace(bytes: number = 1): boolean {
		return this.remainingBytes >= bytes;
	}


	public get remainingBytes(): number {
		return this.byteLength - this.offset;
	}
}



export { BufferReader };