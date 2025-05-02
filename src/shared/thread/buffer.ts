import { BufferReader } from "./reader.js";

import { BufferWriter } from "./writer.js";



export function createBuffer(allocation: number | ArrayBufferLike | ArrayBufferView | BufferWriter | BufferReader = 0, clone: boolean = false, offset: number = 0): Uint8Array {
	if (typeof allocation === "number") {
		return new Uint8Array(allocation);
	}


	let output: Uint8Array;

	if (allocation instanceof ArrayBuffer || allocation instanceof SharedArrayBuffer) {
		output = new Uint8Array(allocation, offset, allocation.byteLength - offset);
	}
	
	else if (allocation instanceof BufferReader || allocation instanceof BufferWriter) {
		output = allocation.buffer;
	}
	
	else {
		output = new Uint8Array(allocation.buffer, allocation.byteOffset, allocation.byteLength);
	}


	return clone ? output.slice() : output;
}