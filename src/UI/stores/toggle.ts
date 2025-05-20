import Game from "../../game";


export const enum Toggles {
	Vertices,
	Textures,
}


export interface Toggle {
	readonly id: Toggles;
	readonly label: string;
	readonly icon: string;
	toggled: boolean;
	disabled?: boolean;
	callback?: (toggled: boolean) => void;
}


export const toggles: Toggle[] = [
	{
		id: Toggles.Vertices,
		label: "Show/hide vertices of the scene",
		icon: "/assets/engine/toggles/vertex.png",
		toggled: false,
		callback: (toggled: boolean) => {
			Game.renderer.renderVertices = toggled;
		}
	},
	{
		id: Toggles.Textures,
		label: "Show/hide textures",
		icon: "/assets/engine/toggles/texture.png",
		toggled: true,
		callback: (toggled: boolean) => {
			Game.renderer.renderTextures = toggled;
		}
	}
];