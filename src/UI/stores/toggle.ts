import { game } from "../../game";


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
		icon: "../../../public/assets/engine/vertex.png",
		toggled: false,
		callback: (toggled: boolean) => {
			game.renderer.renderVertices = toggled;
		}
	},
	{
		id: Toggles.Textures,
		label: "Show/hide textures",
		icon: "../../../public/assets/engine/texture.png",
		toggled: true,
		callback: (toggled: boolean) => {
			game.renderer.renderTextures = toggled;
		}
	}
];