<script lang="ts">
	import Grid from "../components/GridLayout.svelte";
	import { game } from "../../game";
</script>


<style>
	#startButton {
		width: 25vmin;
		height: 7vmin;
	}

	#settings {
	display: flex;
	padding: 2vmin;
	flex-direction: column;
}

#settings label {
	display: flex;
	align-items: center;
	gap: 1vmin;
}

#settings label span {
	width: 15vmin;
}
</style>


<Grid id="menu" gap=2vw middle_center_direction="column">
	{#snippet middle_center()}
		<button type="button" id="startButton" class="center editorBox" onclick={game.startSimulation.bind(game)}>Start</button>

		<div id="settings" class="center editorBox">
			<label title="herbivore">
				<span>Herbivores:</span>
				<input type="range" min="0" max="20000" value="500" step="500">
				<input type="number" min="0" max="100" value="50">
			</label>
			
			<label title="carnivore">
				<span>Carnivores:</span>
				<input type="range" min="0" max="20000" value="500" step="500">
				<input type="number" min="0" max="100" value="50">
			</label>
			
			<label title="plant">
				<span>Plants:</span>
				<input type="range" min="0" max="20000" value="500" step="500">
				<input type="number" min="0" max="100" value="50">
			</label>

			<label title="map.width">
				<span>Map width:</span>
				<input type="range" min="0" max="20000" value="500" step="500">
				<input type="number" min="0" max="100" value="50">
			</label>

			<label title="map.height">
				<span>Map height:</span>
				<input type="range" min="0" max="20000" value="500" step="500">
				<input type="number" min="0" max="100" value="50">
			</label>

			<label title="turbo">
				<span>Turbo:</span>
				<input type="checkbox" min="0" max="20000" value="500" step="500">
			</label>
		</div>
	{/snippet}
</Grid>