// Get the lowest unused id in a list
export function getUnusedID(map: Map<number, any> | Set<number>, excluded: Set<number> | number = new Set(), init: boolean = false): number {
	// Way faster if we know the map is empty (init)
	if (init) {
		return map.size + 1;
	}

	else {
		if (typeof excluded === "number") {
			excluded = new Set([excluded]);
		}

		let i = 1;

		while (map.has(i) || excluded.has(i)) {
			i++;
		}

		return i;
	}
}