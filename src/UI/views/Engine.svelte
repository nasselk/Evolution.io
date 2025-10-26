<script lang="ts">
import Grid from "../components/GridLayout.svelte";
import ToolBar from "../components/ToolBar.svelte";
import ToggleBar from "../components/ToggleBar.svelte";
import Window from "../components/Window.svelte";

import { Timer } from "../../utils/timers/timer";
import { toggles } from "../stores/toggle";
import { tools } from "../stores/tool";

let fadeTimeout: Timer | null = null;
let isEditorVisible = true;

function setEditorVisibility(visible: boolean = true) {
	fadeTimeout?.clear();

	const editor = document.querySelector<HTMLDivElement>("#editor");
	const menu = document.querySelector<HTMLDivElement>("#editorMenu");
	const toolbar = document.querySelector<HTMLDivElement>("#editorTools");
	const togglebar = document.querySelector<HTMLDivElement>("#editorToggles");
	const actionbar = document.querySelector<HTMLDivElement>("#editorActions");

	if (visible) {
		editor?.style.setProperty("display", "grid");
	} else {
		fadeTimeout = new Timer(() => {
			editor?.style.setProperty("display", "none");
		}, 300);
	}

	// Force a reflow to ensure the transition is applied
	void editor?.getBoundingClientRect();

	if (visible) {
		menu?.classList.remove("hidden");
		toolbar?.classList.remove("hidden");
		togglebar?.classList.remove("hidden");
		actionbar?.classList.remove("hidden");
	} else {
		menu?.classList.add("hidden");
		toolbar?.classList.add("hidden");
		togglebar?.classList.add("hidden");
		actionbar?.classList.add("hidden");
	}

	isEditorVisible = visible;
}

window.addEventListener("keydown", (event) => {
	// When using clicks on ctrl, it should hide/show the editor menu
	if (event.key === "Control") {
		setEditorVisibility(!isEditorVisible);
	}
});
</script>


<style>
	:global(:root) {
  		--padding-sm: 1vmin;
  		--padding-md: 2vmin;
  		--padding-lg: 3vmin; 

		--gap-sm: 0.5vmin;
		--gap-md: 1vmin;
		--gap-lg: 2vmin;

		--radius-sm: 1.25vmin;
  		--radius-md: 2vmin;
  		--radius-lg: 16px;

		--border-sm: 1px solid;
		--border-md: 2px solid;
		--border-lg: 4px solid;

  		--font-sm: 0.875rem;
  		--font-md: 2.5vmin;
  		--font-lg: 3vmin;		
	}

	:global(.editorBox) {
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		background: rgba(50, 50, 50, 0.2);
		box-shadow: 0 0.25vmin 1vmin rgba(0, 0, 0, 0.25);
		-webkit-backdrop-filter: blur(3px);
		backdrop-filter: blur(3px);
		border: 0.25vmin solid rgba(150, 150, 150, 0.3);
		border-radius: var(--radius-md);
		box-sizing: border-box;
	}

	:global(.editorBox.pretty) {
		background: rgba(50, 50, 50, 0.2);
		-webkit-backdrop-filter: blur(3px);
		backdrop-filter: blur(3px);
	}

	:global(button:focus) {
		outline: none;
	}


	:global(#editorMenu.hidden) {
        opacity: 0;
        transform: translateX(100%);
    }
</style>


<Grid id="editor" padding=var(--padding-lg) gap=var(--gap-lg) bottom_left_direction="row">
    {#snippet bottom_left()}
        <ToolBar id="editorTools" class="editorBox" { tools } />
		<ToggleBar id="editorToggles" class="editorBox" {toggles} />
    {/snippet}
</Grid>