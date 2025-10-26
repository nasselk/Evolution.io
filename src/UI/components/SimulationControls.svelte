<script lang="ts">
import Game from "../../game";

const state = $state({
	paused: false,
	time: "00:00",
	speed: 1,
});

const { reset } = $props();

function formatTime(uptime: number): string {
	const minutes = Math.floor(uptime / 60000);
	const seconds = Math.floor((uptime % 60000) / 1000);

	return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function switchSimulationState(): void {
	state.paused = !state.paused;

	Game.setSimulationState(state.paused);
}

function stopSimulation(): void {
	Game.stopSimulation();

	reset();

	state.time = "00:00";
	state.paused = false;
	state.speed = 1;
}

function accelerate(): void {
	if (state.speed < 10) {
		state.speed += 1;

		Game.setSimulationSpeed(state.speed);
	}
}

function decelerate(): void {
	if (state.speed > 1) {
		state.speed -= 1;

		Game.setSimulationSpeed(state.speed);
	}
}

export function update(uptime: number, paused: boolean = state.paused, speed: number = state.speed): void {
	state.time = formatTime(uptime);
	state.paused = paused;
	state.speed = speed;
}
</script>



<style>
	#controlPanel {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		grid-template-rows: auto auto auto;
		padding: var(--padding-md);
		gap: var(--gap-md);
		justify-items: center;
	}


	.label {
		font-size: var(--font-md);
		color: rgba(255, 255, 255, 0.7);
		text-align: center;
	}

	.value {
		color: rgba(255, 255, 255, 0.85);
		font-weight: bold;
		text-align: center;
	}


	#time {
		font-size: var(--font-lg);
	}

	#speed {
		font-size: var(--font-md);
	}
	

	.action {
		font-size: var(--font-md);
		cursor: pointer;
		border: var(--border-md);
		border-radius: var(--radius-sm);
	}


	.stateAction {
		width: 10vmin;
	}

	#pause {
		background-color: rgba(200, 150, 0, 0.3);
		border-color: rgba(200, 150, 0, 0.3);
	}

	:global(#pause.paused) {
		background-color: rgba(0, 150, 50, 0.3);
		border-color: rgba(0, 150, 50, 0.3);
	}

	#stop {
		background-color: rgba(200, 0, 0, 0.3);
		border-color: rgba(200, 0, 0, 0.3);
	}


	.speedAction {
		background-color: rgb(0, 150, 150, 0.3);
		border-color: rgba(0, 150, 150, 0.3);
		width: 6vmin
	}
</style>



<div id="controlPanel" class="editorBox">
	<div class="label"></div>
	<div class="label">Time</div>
	<div class="label"></div>	

	<button id="pause" class="action stateAction { state.paused ? "paused" : "" }" type="button" onclick={ switchSimulationState }>{ state.paused ? "Resume" : "Pause" }</button>
	<div id="time" class="value">{ state.time }</div>
	<button id="stop" class="action stateAction" type="button" onclick={ stopSimulation }>Stop</button>

	<button id="decelerate" class="action speedAction" type="button" onclick={ decelerate }>-</button>
	<div id="speed" class="value">x{ state.speed }</div>
	<button id="accelerate" class="action speedAction" type="button" onclick={ accelerate }>+</button>
</div>