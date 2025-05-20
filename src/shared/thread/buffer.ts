import { BufferReader } from "./reader.js";

import { BufferWriter } from "./writer.js";


export type Buffers = ArrayBufferLike | ArrayBufferView | BufferWriter | BufferReader;


export function createBuffer(allocation: number | Buffers = 0, clone: boolean = false, offset: number = 0): Uint8Array {
	if (typeof allocation === "number") {
		return new Uint8Array(allocation);
	}


	let output: Uint8Array;

	if (allocation instanceof ArrayBuffer || allocation instanceof SharedArrayBuffer) {
		output = new Uint8Array(allocation, offset);
	}

	else if (allocation instanceof BufferReader || allocation instanceof BufferWriter) {
		output = allocation.buffer;
	}

	else {
		output = new Uint8Array(allocation.buffer, offset);
	}


	return clone ? output.slice() : output;
}


export type ArrayViewLike = Uint8Array | Int8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array;

export function isBufferView(buffer: unknown): buffer is ArrayViewLike {
	return buffer instanceof Uint8Array ||
		buffer instanceof Int8Array ||
		buffer instanceof Uint8ClampedArray ||
		buffer instanceof Int16Array ||
		buffer instanceof Uint16Array ||
		buffer instanceof Int32Array ||
		buffer instanceof Uint32Array ||
		buffer instanceof Float32Array ||
		buffer instanceof Float64Array;
}