<script lang="ts">
    import SelectorHighlight from "./SelectorHighlight.svelte";
    import { Toggles, type Toggle } from "../stores/toggle";
    import { onMount, onDestroy } from "svelte";
    

    const { id = "", class: classList = "", toggles: t = [] } = $props();


	const toggles = $state<Toggle[]>(t);

    
    // Store references to SelectorHighlight components
    const highlightComponents = $state<Record<string, SelectorHighlight>>({});
    const buttons = $state<Record<string, HTMLButtonElement | null>>({});
	let pressedToggle: Toggles | null = null;
    

    function updateHighlight(toggle: Toggle, pressed: boolean = false, event?: MouseEvent) {
        if (!event || event.button === 0) {
			if (pressed) {
				pressedToggle = toggle.id;
        	}
			
			else {
            	pressedToggle = null;
			}

            const button = buttons[toggle.id];
            const isActive = toggle.toggled;
            
            if (button && highlightComponents[toggle.id]) {
                highlightComponents[toggle.id].updateHighlight(pressed, isActive, button);
            }
        }
    }


    function toggleOption(toggle: Toggle): void {
		toggle.toggled = !toggle.toggled;

		toggle.callback?.(toggle.toggled);
        
        updateHighlight(toggle);
    }
    

    function handleGlobalMouseUp() {
		const toggle = toggles.find(t => t.id === pressedToggle);

		// When mouse is released, remove all highlight effects
		if (toggle) {
			updateHighlight(toggle, false);
		}

		pressedToggle = null;
    }

    
    function initializeHighlights() {
        for (const toggle of toggles) {
            // Initialize highlighting with proper active state
            updateHighlight(toggle, false);

			toggle.callback?.(toggle.toggled);
        }
    }

    
    onMount(() => {
        window.addEventListener("mouseup", handleGlobalMouseUp);

		initializeHighlights()
    });
    
	
    onDestroy(() => {
        window.removeEventListener("mouseup", handleGlobalMouseUp);
    });
</script>


<style>
    .togglebar {
        display: flex;
        position: relative;
		padding: var(--padding-sm);
        gap: var(--gap-lg);
        transition: all 0.3s ease;
    }

    :global(.togglebar.hidden) {
        opacity: 0;
        transform: translateY(100%);
    }

    .toggle {
        border: none;
        cursor: pointer;
        background-color: transparent;
        position: relative;
        padding: 0;
    }

    .toggle > img {
        height: 4.5vmin;
        width: 4.5vmin;
        transition: transform 0.3s ease;
        object-fit: contain;
        object-position: center;
    }

    .toggle:not(.active):hover > img {
        transform: scale(1.1);
    }
</style>


<div class="togglebar { classList }" id={id}>
    {#each toggles as toggle (toggle.id)}
		{#if !toggle.disabled} 
			<SelectorHighlight bind:this={highlightComponents[toggle.id]} />

        	<button
            	type="button"
            	class="toggle {toggle.toggled ? 'active' : ''}"
            	data-toggle-id={toggle.id}
            	onclick={() => toggleOption(toggle)}
            	onmousedown={(event) => updateHighlight(toggle, true, event)}
            	title={toggle.label}
				bind:this={buttons[toggle.id]}
        	>
            <img src={toggle.icon} alt={toggle.label} />
        </button>
		{/if}
    {/each}
</div>