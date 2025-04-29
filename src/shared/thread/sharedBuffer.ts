import { BufferReader } from "./reader";

import { BufferWriter } from "./writer";



class SharedBuffer {
	public readonly flags: { bytes: number, value: number }[];
	public readonly buffer: SharedArrayBuffer;
	public readonly writer: BufferWriter;
	public readonly reader: BufferReader;


	public constructor(buffer: SharedArrayBuffer | number, flags: { bytes: number, value: number }[] = []) {
		if (typeof buffer === "number") {
			this.buffer = new SharedArrayBuffer(buffer);
		}

		else {
			this.buffer = buffer;
		}

		this.writer = new BufferWriter(this.buffer);
		this.reader = new BufferReader(this.buffer);
		this.flags = flags;

		this.resetFlags();
	}
	

	public resetFlags(): void {
		this.writer.reset();


		for (const flag of this.flags) {
			switch (flag.bytes) {
				case 1: {
					this.writer.writeUint8(flag.value);

					break;
				}

				case 2: {
					this.writer.writeUint16(flag.value);

					break;
				}

				case 4: {
					this.writer.writeUint32(flag.value);

					break;
				}
			}
		}
	}


	public unlinkReader(): BufferReader {
		// Create a new ArrayBuffer of the same size
		const copy = this.buffer.slice(0);


		return new BufferReader(copy);
	}
}



export { SharedBuffer };