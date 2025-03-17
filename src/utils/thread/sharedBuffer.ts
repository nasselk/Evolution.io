import { MsgReader } from "./reader";

import { MsgWriter } from "./writer";



class SharedBuffer {
	public readonly flags: { bytes: number, value: number }[];
	public readonly buffer: SharedArrayBuffer;
	public readonly writer: MsgWriter;
	public readonly reader: MsgReader;


	public constructor(buffer: SharedArrayBuffer | number, flags: { bytes: number, value: number }[] = []) {
		if (typeof buffer === "number") {
			this.buffer = new SharedArrayBuffer(buffer);
		}

		else {
			this.buffer = buffer;
		}

		this.writer = new MsgWriter(this.buffer);
		this.reader = new MsgReader(this.buffer);
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


	public unlinkReader(): MsgReader {
		// Create a new ArrayBuffer of the same size
		const copy = this.buffer.slice(0);


		return new MsgReader(copy);
	}
}



export { SharedBuffer };