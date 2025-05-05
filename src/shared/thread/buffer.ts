import { BufferReader } from "./reader.js";

import { BufferWriter } from "./writer.js";



export function createBuffer(allocation: number | ArrayBufferLike | ArrayBufferView | BufferWriter | BufferReader = 0, clone: boolean = false): Uint8Array {
	let output: Uint8Array;

	
	if (typeof allocation === "number") {
		output = new Uint8Array(allocation);
	}

	else if (allocation instanceof ArrayBuffer || allocation instanceof SharedArrayBuffer) {
		output = new Uint8Array(allocation);
	}
	
	else if (allocation instanceof BufferReader || allocation instanceof BufferWriter) {
		output = allocation.buffer;
	}

	else {
		output = new Uint8Array(allocation.buffer);
	}


	return clone ? output.slice() : output;
}