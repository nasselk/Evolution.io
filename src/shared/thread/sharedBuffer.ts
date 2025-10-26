import { BufferReader } from "./reader";

import { BufferWriter } from "./writer";

enum State {
	UNLOCKED,
	LOCKED,
}

class SharedBuffer {
	public readonly flags: { bytes: number; value: number }[];
	public readonly buffer: SharedArrayBuffer;
	public readonly writer: BufferWriter;
	public readonly reader: BufferReader;
	private readonly locker: Int32Array; // For atomic operations
	public readonly byteLength: number;

	public constructor(allocation: SharedArrayBuffer | number, flags: { bytes: number; value: number }[] = []) {
		if (typeof allocation === "number") {
			this.buffer = new SharedArrayBuffer(4 + allocation);
		} else {
			if (allocation.byteLength <= 4) {
				throw new Error("SharedBuffer size must be greater than 4 bytes");
			}

			this.buffer = allocation;
		}

		this.locker = new Int32Array(this.buffer, 0, 1);
		this.writer = new BufferWriter(this.buffer, false, false, 4);
		this.reader = new BufferReader(this.buffer, false, 4);
		this.byteLength = this.buffer.byteLength;
		this.flags = flags;

		this.resetFlags();
	}

	public tryLock(): boolean {
		return Atomics.compareExchange(this.locker, 0, State.UNLOCKED, State.LOCKED) === State.UNLOCKED;
	}

	public lock(timeout: number = Infinity): boolean {
		const start = performance.now();

		while (!this.tryLock()) {
			if (timeout !== Infinity && performance.now() - start > timeout) {
				return false;
			}

			const remaining = timeout === Infinity ? Infinity : timeout - (performance.now() - start);

			Atomics.wait(this.locker, 0, State.LOCKED, remaining);
		}

		return true;
	}

	// For main thread - async polling approach
	public lockAsync(timeout: number = Infinity): boolean {
		const start = performance.now();

		while (!this.tryLock()) {
			if (timeout !== Infinity && performance.now() - start > timeout) {
				return false;
			}
		}

		return true;
	}

	public unlock(): void {
		Atomics.store(this.locker, 0, State.UNLOCKED);

		Atomics.notify(this.locker, 0, 1);
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
		const copy = this.buffer.slice(4);

		return new BufferReader(copy, false);
	}
}

export { SharedBuffer };
