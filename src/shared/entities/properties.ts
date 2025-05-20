import { Entities } from "./types.js";



interface EntityConfig {
	readonly dynamic: boolean;
	readonly updatable: boolean;
}



export const EntitiesConfig: Record<keyof typeof Entities, EntityConfig> = {
	carnivore: {
		dynamic: true,
		updatable: true
	},

	herbivore: {
		dynamic: true,
		updatable: true
	},

	plant: {
		dynamic: true,
		updatable: true
	}
};