export function removeFromArray<T>(array: T[], item?: T, index?: number): T | void {
	if (index !== undefined) {
		const last = array.pop();

		if (index < array.length) {
			array[index] = last!;

			return last!;
		}
	}

	else {
		for (let i = 0; i < array.length; i++) {
			if (array[i] === item) {
				const last = array.pop();

				if (i < array.length) {
					array[i] = last!;

					return last!;
				}

				break;
			}
		}
	}
}



export function updateCopy<T>(obj: T): T {
	if (obj === null || typeof obj !== "object") {
		return obj;
	}

	else if (obj instanceof Uint8Array) {
		return obj; // No need to copy buffers as they're not modified by different sockets
	}

	else if (Array.isArray(obj)) {
		const copyArray = new Array(obj.length);

		for (let i = 0; i < obj.length; i++) {
			copyArray[i] = updateCopy(obj[i]);
		}

		return copyArray as T;
	}


	const copy: { [key: string]: any } = {};

	for (const [key, value] of Object.entries(obj)) {
		copy[key] = updateCopy(value);
	}

	return copy as T;
}



export function prioritizeProperty<T extends Record<string, any>>(obj: T, key: string): T {
	const newObj: Record<string, any> = {
		[ key ]: obj[key]
	};

	for (const k in obj) {
		if (k !== key) {
			newObj[k] = obj[k];
		}
	}

	return newObj as T;
}



export function deprioritizeProperty<T extends Record<string, any>>(obj: T, key: string): T {
	const newObj: Record<string, any> = {};

	for (const k in obj) {
		if (k !== key) {
			newObj[k] = obj[k];
		}
	}

	newObj[key] = obj[key];

	return newObj as T;
}