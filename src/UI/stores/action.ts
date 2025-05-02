export const enum Actions {
	Reset,
	Textures,
}


export interface Action {
	readonly id: Actions;
	readonly label: string;
	readonly icon: string;
	disabled?: boolean;
	callback?: () => void;
}


export const actions: Action[] = [
	{
		id: Actions.Reset,
		label: "Reset the camera position and zoom to the player",
		icon: "../../../public/assets/engine/reset.png",
		callback: () => {
			
		}
	},
];