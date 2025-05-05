import { type EntityTypes, type Entity } from "./entities/entity.js";

import { error } from "../utils/logger.js";



const layers = {
	default: [
		"map",
		"plant",
		"leaf",
		"herbivore",
		"carnivore",
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



function getLayer(entity: Entity | EntityTypes): number {
	const type = typeof entity === "string" ? entity : entity.type;


	const settings = {
		layer: 0,
	};


	try {
		return mappedLayers.get("default")!.get(type)[settings.layer];
	}

	catch (e) {
		error(`Layer not found for entity: ${type}`, e);

		return 0;
	}
}



export { getLayer };