export let updateSimulationData: (uptime: number, carnivores: number, herbivores: number, plants: number) => void;

export function registerHandler(component: any) {
	updateSimulationData = component.callback;
}
