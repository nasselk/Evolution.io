

<script lang="ts">
    import { activeTool, Tools, type Tool } from "../stores/tool";
    import SelectorHighlight from "./SelectorHighlight.svelte";
    import { onMount, onDestroy } from "svelte";
    

    const { id = "", class: classList = "", tools = [], default: defaultTool = Tools.Default } = $props();
    

    let highlightComponent: SelectorHighlight;
    let activeButton: HTMLButtonElement | null = null;
    let pressedTool: Tools | null = null;
    

    function updateHighlight(toolId: Tools, pressed: boolean = false, event?: MouseEvent) {
        if (!event || event.button === 0) {
            if (pressed) {
                pressedTool = toolId;
            } 
			
			else if (pressedTool === toolId) {
                pressedTool = null;
            }
            
            const button = document.querySelector(`.toolbar > button[data-tool-id="${toolId}"]`) as HTMLButtonElement;
            //const isActive = $activeTool?.id === toolId;
            
            if (button && highlightComponent) {
                activeButton = button;
                highlightComponent.updateHighlight(button, pressed, true);
            }
        }
    }


	function selectTool(tool: Tool): void {
        document.body.style.cursor = tool.cursor;
        activeTool.set(tool);
        
        updateHighlight(tool.id);
    }
    

    function handleGlobalMouseUp() {
        if (pressedTool !== null) {
            updateHighlight(pressedTool, false);
        }
    }

    
    function initializeHighlight() {
        if (tools.length > 0) {
            const firstTool = tools.find(tool => tool.id === defaultTool);
            const button = document.querySelector(`.toolbar > button[data-tool-id="${firstTool.id}"]`);
            
            if (button) {
                activeButton = button as HTMLButtonElement;
                activeTool.set(firstTool);
                document.body.style.cursor = firstTool.cursor;
                
                if (highlightComponent && activeButton) {
                	highlightComponent.updateHighlight(activeButton, false, true);
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
        padding: 1vmin;
        gap: 3vmin;
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
        margin: 0;
    }

    .tool > img {
        height: 40px;
        width: 40px;
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
            onmousedown={(event) => updateHighlight(tool.id, true, event)}
        >
            <img src={tool.icon} alt={tool.label} class="cursor-icon" />
        </button>
    {/each}
</div>