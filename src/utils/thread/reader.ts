class MsgReader {
	private static readonly textDecoder = new TextDecoder();

	public readonly buffer: ArrayBufferLike;
	private readonly view: DataView;
	public readonly byteLength: number;
	public lastFlagIndex: number;
	public flagOffset: number;
	public offset: number;


	public constructor(buffer: ArrayBufferLike) {
		this.buffer = buffer;
		this.view = new DataView(this.buffer);
		this.byteLength = this.buffer.byteLength;
		this.lastFlagIndex = 0;
		this.flagOffset = 0;
		this.offset = 0;
	}


	public static readTextBuffer(buffer: ArrayBuffer): string {
		return MsgReader.textDecoder.decode(buffer);
	}


	public static fromPrecision(value: number, maximum: number, bits: number, safetyOffset: number = 1000) {
		const bound = 2 ** bits - 1;

		return Math.round(value * (maximum + safetyOffset) / bound);
	}


	public readBit(bits: number = 1, increment: boolean = true): boolean | number {
		let value: number = 0;


		for (let i: number = 0; i < bits; i++) {
			if (this.lastFlagIndex === 0) {
				this.flagOffset = this.offset;
				
				this.offset++;
			}

			const flag = this.readUint8(increment, this.flagOffset);
			const bit = (flag >> this.lastFlagIndex) & 1;

			value |= bit << i;

			if (increment) {
				this.lastFlagIndex = (this.lastFlagIndex + 1) % 8;
			}
		}


		return bits === 1 ? Boolean(value) : value;
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


	public readBuffer(length: number = this.buffer.byteLength - this.offset, increment: boolean = true, offset: number = this.offset): ArrayBufferLike {
		const buffer = this.buffer.slice(offset, offset + length);
		
		if (increment && offset === this.offset) {
			this.offset += length;
		}
		
		return buffer;
	}


	public readText(readLength?: boolean, increment?: boolean, offset?: number): string;
	public readText(length?: number, increment?: boolean, offset?: number): string;
	public readText(a: number | boolean = this.buffer.byteLength - this.offset, increment: boolean = true, offset: number = this.offset): string {
		let additionalOffset = 0;

		if (typeof a === "boolean") {
			a = this.readUint16(increment, offset);

			additionalOffset = 2;
		}


		const buffer = this.buffer.slice(offset + additionalOffset, offset + additionalOffset + a);

		if (increment && offset === this.offset) {
			this.offset += a;
		}


		return MsgReader.textDecoder.decode(buffer as ArrayBuffer);
	}


	public reset(offset: number = 0): void {
		this.offset = offset;
		this.lastFlagIndex = 0;
		this.flagOffset = 0;
	}


	public get remainingBytes(): number {
		return this.buffer.byteLength - this.offset;
	}


	public hasSpace(byteLength: number = 1): boolean {
		return this.remainingBytes >= byteLength;
	}
}



export { MsgReader };