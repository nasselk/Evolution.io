// Get the lowest unused id in a list
export function getUnusedID(map: Map<number, any> | Set<number>, excluded: Set<number> | number = new Set()): number {
	if (typeof excluded === "number") {
		excluded = new Set([excluded]);
	}

	let i = 1;

	while (map.has(i) || excluded.has(i)) {
		i++;
	}

	return i;
}