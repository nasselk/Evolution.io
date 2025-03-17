import { type Entity } from "../entities/entity.js";

import { error } from "../utils/logger.js";



const layers = {
	default: [
		"map",
		"obstacle",
		"player",
	]
};



type RecievedLayers = { [key: string]: RecievedLayers } | string[];
type ProcessedLayers = Map<string, number[] | ProcessedLayers>;

function processLayers(attributes: RecievedLayers, counter: { value: number } = { value: 0 }): ProcessedLayers {
	const map: ProcessedLayers = new Map();

	if (Array.isArray(attributes)) {
		for (const type of attributes) {
			const layer = counter.value++;

			if (map.has(type)) {
				const existing = map.get(type) as number[];

				existing.push(layer);
			}

			else {
				map.set(type, [layer]);
			}
		}

		return map;
	}

	else if (attributes !== null && typeof attributes === "object") {
		for (const [selector, value] of Object.entries(attributes)) {
			map.set(selector, processLayers(value, counter));
		}
		return map;
	}

	throw new Error("Invalid layers inputs provided");
}



const mappedLayers = processLayers(layers);



function getLayer(entity: Entity | string, ...params: string[]): number {
	const type = typeof entity === "string" ? entity : entity.type;

	const isEntity = typeof entity !== "string";

	const settings = {
		flying: isEntity ? entity.flying : false,
		diving: isEntity ? entity.diving : false,
		layer: 0,
	};


	for (const key of params) {
		if (key.startsWith("layer")) {
			settings.layer = parseInt(key.replace("layer", "")) - 1;
		}

		else {
			settings[key as keyof typeof settings] = true;
		}
	}


	if (settings.flying) {
		return mappedLayers.get("flying")!.get(type)[settings.layer];
	}


	else if (settings.diving) {
		return mappedLayers.get("diving")!.get(type)[settings.layer];
	}


	try {
		return mappedLayers.get("default")!.get(type)[settings.layer];
	}

	catch (e) {
		error(`Layer not found for entity: ${type}`, e);

		return 0;
	}
}



export { getLayer };