import { BufferReader } from "./reader";

import { BufferWriter } from "./writer";



enum State {
	UNLOCKED,
	LOCKED,
}


class SharedBuffer {
	public readonly flags: { bytes: number, value: number }[];
	public readonly buffer: SharedArrayBuffer;
	public readonly writer: BufferWriter;
	public readonly reader: BufferReader;
	private readonly locker: Int32Array; // For atomic operations


	public constructor(buffer: SharedArrayBuffer | number, flags: { bytes: number, value: number }[] = []) {
		if (typeof buffer === "number") {
			if (buffer <= 4) {
				throw new Error("SharedBuffer size must be greater than 4 bytes");
			}

			this.buffer = new SharedArrayBuffer(buffer);
		}

		else {
			if (buffer.byteLength <= 4) {
				throw new Error("SharedBuffer size must be greater than 4 bytes");
			}

			this.buffer = buffer;
		}
		

		this.locker = new Int32Array(this.buffer, 0, 1);
		this.writer = new BufferWriter(this.buffer, false, false, 4);
		this.reader = new BufferReader(this.buffer, false, 4);
		this.flags = flags;

		this.resetFlags();

		console.log(this.buffer.byteLength);
	}


	public lock(timeout: number = Infinity): boolean {
		const start = performance.now();

		while (Atomics.compareExchange(this.locker, 0, State.UNLOCKED, State.LOCKED) !== State.UNLOCKED) {
			if (timeout !== Infinity && performance.now() - start > timeout) {
				return false;
			}

			const remaining = timeout === Infinity ? Infinity : timeout - (performance.now() - start);

			Atomics.wait(
				this.locker,
				0,
				State.LOCKED,
				remaining
			);
		}

		return true;
	}


	public tryLock(): boolean {
		// Non-blocking attempt to acquire lock
		return Atomics.compareExchange(this.locker, 0, State.UNLOCKED, State.LOCKED) === State.UNLOCKED;
	}

	// For main thread - async polling approach
	public async lockAsync(timeout: number = 5000): Promise<boolean> {
		const start = performance.now();

		// Try immediately first
		if (this.tryLock()) return true;

		// Then keep trying with setTimeout
		return new Promise(resolve => {
			const attempt = () => {
				if (this.tryLock()) {
					resolve(true);
					return;
				}

				if (timeout !== Infinity && performance.now() - start > timeout) {
					resolve(false);
					return;
				}

				setTimeout(attempt, 1);
			};

			setTimeout(attempt, 1);
		});
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