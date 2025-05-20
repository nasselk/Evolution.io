<script lang="ts">
	import Controls from "../components/SimulationControls.svelte";
	import Chart from "../components/SimulationChart.svelte";
    import Grid from "../components/GridLayout.svelte";
    import Window from "../components/Window.svelte";

	import { registerHandler } from "../stores/HUD";
	import { onMount } from "svelte";


	let controls: Controls;
	let carnivoreChart: Chart;
    let herbivoreChart: Chart;
    let plantChart: Chart;


    onMount(() => {
		registerHandler({
        	callback: update
    	});
    });
	

	function update(uptime: number, carnivores: number, herbivores: number, plants: number): void {   
		carnivoreChart.updateData(carnivores);
		herbivoreChart.updateData(herbivores);
		plantChart.updateData(plants);

		controls.update(uptime);
	}
</script>



<style>
	:global(#HUD) {
		display: none;
	}
</style>



<Grid id="HUD" padding=var(--padding-lg) gap=var(--gap-lg)>
	{#snippet middle_right()}
		<Window class="editorBox" title="Carnivores" width=325px height=200px padding=var(--padding-sm) resizable={false} moveable={false}>
			<Chart bind:this={carnivoreChart} label="Carnivore population" r=255 g=99 b=132 />
		</Window>
		<Window class="editorBox" title="Herbivores" width=325px height=200px padding=var(--padding-sm) resizable={false} moveable={false}>
			<Chart bind:this={herbivoreChart} label="Herbivore population" r=75 g=192 b=192 />
		</Window>	
		<Window class="editorBox" title="Plants" width=325px height=200px padding=var(--padding-sm) resizable={false} moveable={false}>
			<Chart bind:this={plantChart} label="Plant population" r=75 g=192 b=75 />
		</Window>
	{/snippet}


    {#snippet bottom_center()}
    	<Controls bind:this={controls} reset={() => {
			carnivoreChart.reset();
			herbivoreChart.reset();
			plantChart.reset();
		}}/>
	{/snippet}
</Grid>