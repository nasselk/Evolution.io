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