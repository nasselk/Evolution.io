export const enum Actions {
	Vertices,
	Textures,
}


export interface Action {
	readonly id: Actions;
	readonly label: string;
	readonly icon: string;
	available?: boolean;
	callback?: () => void;
}


export const actions: Action[] = [
	{
		id: Actions.Vertices,
		label: "Show/hide vertices of the scene",
		icon: "../../../public/assets/engine/vertex.png",
		available: true,
		callback: () => {
			console.log("HELPEU");
		}
	},
	{
		id: Actions.Textures,
		label: "Show/hide textures",
		icon: "../../../public/assets/engine/texture.png",
		available: true,
		callback: () => {
		}
	},
];