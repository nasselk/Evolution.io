// Efficiently remove elemnent from a generic array by swaping it with the last element
export function removeFromArray<T>(array: T[], item?: T, index?: number): T | void {
	if (index !== undefined) {
		const last = array.pop();

		if (index < array.length) {
			array[index] = last!;

			return last!;
		}
	} else {
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
