<script lang="ts">
import { activeTool, Tools, type Tool } from "../stores/tool";
import SelectorHighlight from "./SelectorHighlight.svelte";
import { onMount, onDestroy } from "svelte";

const { id = "", class: classList = "", tools = [], default: defaultTool = Tools.Camera } = $props();

let highlightComponent: SelectorHighlight;

function updateHighlight(pressed: boolean = false, toolId?: Tools, event?: MouseEvent) {
	if (!event || event.button === 0) {
		const button = document.querySelector(`.toolbar > button[data-tool-id="${toolId}"]`) as HTMLButtonElement;

		highlightComponent.updateHighlight(pressed, true, button);
	}
}

function selectTool(tool: Tool): void {
	document.body.style.cursor = tool.cursor;

	activeTool.set(tool);
}

function handleGlobalMouseUp() {
	updateHighlight();
}

function initializeHighlight() {
	if (tools.length > 0) {
		const firstTool = tools.find((tool) => tool.id === defaultTool);
		const button = document.querySelector(`.toolbar > button[data-tool-id="${firstTool.id}"]`);

		if (button) {
			activeTool.set(firstTool);
			document.body.style.cursor = firstTool.cursor;

			if (highlightComponent) {
				highlightComponent.updateHighlight(false, true, button);
			}
		}
	}
}

onMount(() => {
	window.addEventListener("mouseup", handleGlobalMouseUp);
	initializeHighlight();
});

onDestroy(() => {
	window.removeEventListener("mouseup", handleGlobalMouseUp);
});
</script>



<style>
    .toolbar {
        display: flex;
        position: relative;
        padding: var(--padding-sm);
        gap: var(--gap-lg);
        transition: all 0.3s ease;
    }

    :global(.toolbar.hidden) {
        opacity: 0;
        transform: translateY(100%);
    }

    .tool {
        border: none;
        cursor: pointer;
        background-color: transparent;
        position: relative;
        padding: 0;
    }

    .tool > img {
        height: 4.5vmin;
        width: 4.5vmin;
        transition: transform 0.3s ease;
        object-fit: contain;
        object-position: center;
    }

    .tool:not(.selected):hover > img {
        transform: scale(1.1);
    }
</style>



<div class="toolbar { classList }" id={id}>
    <SelectorHighlight bind:this={highlightComponent} />
    
    {#each tools as tool (tool.id)}
        <button
            type="button"
            class="tool { ($activeTool?.id === tool.id) ? 'selected' : '' }"
			data-tool-id={tool.id}
            title={tool.label}
            onclick={(event) => selectTool(tool)}
            onmousedown={(event) => updateHighlight(true, tool.id, event)}
        >
            <img src={tool.icon} alt={tool.label} class="cursor-icon" />
        </button>
    {/each}
</div>