<script lang="ts">
    import SelectorHighlight from "./SelectorHighlight.svelte";
    import { onMount, onDestroy } from "svelte";


    const { id = "", class: classList = "", actions = [] } = $props();
    
    // Store references to SelectorHighlight components
    const highlightComponents = $state<Record<string, SelectorHighlight>>({});
    const buttons = $state<Record<string, HTMLButtonElement | null>>({});
    let pressedAction: string | null = null;

    
    function updateHighlight(actionId: string, pressed: boolean = false, event?: MouseEvent) {
        if (!event || event.button === 0) {
            if (pressed) {
                pressedAction = actionId;
            } 
			
			else {
                pressedAction = null;
            }

            const button = buttons[actionId];
            
            if (button && highlightComponents[actionId]) {
                // For actions, we don't have an "active" state, just pressed
                highlightComponents[actionId].updateHighlight(button, pressed, false);
            }
        }
    }

    
    function handleGlobalMouseUp() {
        if (pressedAction) {
            updateHighlight(pressedAction, false);

            pressedAction = null;
        }
    }
    

    onMount(() => {
        window.addEventListener("mouseup", handleGlobalMouseUp);
    });

    
    onDestroy(() => {
        window.removeEventListener("mouseup", handleGlobalMouseUp);
    });
</script>


<style>
    .actionbar {
        display: flex;
        position: relative;
        padding: 1vmin;
        gap: 3vmin;
        transition: all 0.3s ease;
    }

    :global(.actionbar.hidden) {
        opacity: 0;
        transform: translateY(100%);
    }

    .action {
        border: none;
        cursor: pointer;
        background-color: transparent;
        position: relative;
        padding: 0;
        margin: 0;
    }

    .action > img {
        height: 40px;
        width: 40px;
        transition: transform 0.3s ease;
        object-fit: contain;
        object-position: center;
    }

    .action:hover > img {
        transform: scale(1.1);
    }
</style>


<div class="actionbar { classList }" id={id}>
    {#each actions as action (action.id)}
        {#if !action.disabled} 
            <SelectorHighlight bind:this={highlightComponents[action.id]} />

            <button
                type="button"
                class="action"
                data-action-id={action.id}
                onclick={() => action.callback?.()}
                onmousedown={(event) => updateHighlight(action.id, true, event)}
                title={action.label}
				bind:this={buttons[action.id]}
            >
                <img src={action.icon} alt={action.label} />
            </button>
        {/if}
    {/each}
</div>