<script lang="ts">
    import Grid from "../components/GridLayout.svelte";
    import Window from "../components/Window.svelte";
    
    let isPlaying = true;
    let simulationSpeed = 1;
    let time = 0;
    
    // Format time as MM:SS
    $: formattedTime = () => {
        const minutes = Math.floor(time / 60).toString().padStart(2, '0');
        const seconds = Math.floor(time % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };
    
    function togglePlay() {
        isPlaying = !isPlaying;
    }
    
    function stopSimulation() {
        isPlaying = false;
        time = 0;
    }
    
    function decreaseSpeed() {
        if (simulationSpeed > 0.5) simulationSpeed -= 0.5;
    }
    
    function increaseSpeed() {
        if (simulationSpeed < 3) simulationSpeed += 0.5;
    }
</script>


<style>
    #simulation {
        padding: 1rem 1.8rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        max-width: 360px;
        margin: 0 auto;
    }
    
    .timer-display {
        font-size: 2.6rem;
        font-weight: 700;
        color: #fff;
        margin: 0;
        text-shadow: 0 2px 8px rgba(0,0,0,0.15);
        letter-spacing: 0.06em;
        font-variant-numeric: tabular-nums;
    }
    
    .control-row {
        display: flex;
        gap: 1.4rem;
        align-items: center;
        justify-content: center;
        width: 100%;
    }
    
    .speed-control-wrapper {
        background: rgba(255, 255, 255, 0.08);
        border-radius: 20px;
        padding: 0.6rem;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: inset 0 1px 3px rgba(0,0,0,0.1), 0 1px 0 rgba(255,255,255,0.05);
    }
    
    .btn {
        background: rgba(255, 255, 255, 0.09);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 14px;
        color: white;
        cursor: pointer;
        transition: all 0.15s ease-out;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        backdrop-filter: blur(2px);
        -webkit-backdrop-filter: blur(2px);
    }
    
    .btn-icon {
        width: 3.2rem;
        height: 3.2rem;
        padding: 0.7rem;
    }
    
    .btn-speed {
        width: 2.8rem;
        height: 2.8rem;
        padding: 0.6rem;
        background: rgba(100, 180, 255, 0.08);
        border-color: rgba(100, 180, 255, 0.2);
    }
    
    .btn:hover {
        transform: translateY(-2px);
        background: rgba(255, 255, 255, 0.14);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
        border-color: rgba(255, 255, 255, 0.25);
    }
    
    .btn:active {
        transform: translateY(0);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .btn svg {
        width: 100%;
        height: 100%;
        fill: white;
    }
    
    .btn-speed:hover {
        background: rgba(100, 180, 255, 0.14);
        border-color: rgba(100, 180, 255, 0.35);
    }
    
    .btn-play {
        background: rgba(255, 200, 0, 0.08);
        border-color: rgba(255, 200, 0, 0.25);
    }
    
    .btn-play:hover {
        background: rgba(255, 200, 0, 0.16);
        border-color: rgba(255, 200, 0, 0.4);
    }
    
    .btn-stop {
        background: rgba(255, 80, 80, 0.08);
        border-color: rgba(255, 80, 80, 0.25);
    }
    
    .btn-stop:hover {
        background: rgba(255, 80, 80, 0.16);
        border-color: rgba(255, 80, 80, 0.4);
    }
    
    .speed-indicator {
        background: rgba(255, 255, 255, 0.07);
        border: 1px solid rgba(100, 180, 255, 0.2);
        border-radius: 12px;
        padding: 0.5rem 0;
        color: white;
        font-weight: 500;
        width: 5rem;
        text-align: center;
        letter-spacing: 0.05em;
        font-size: 1.15rem;
    }
    
    .playback-controls {
        margin-top: 0.3rem;
        display: flex;
        gap: 1.4rem;
        justify-content: center;
    }
</style>

<Grid id="gameUI" padding="var(--padding)" gap="var(--gap)">
	{#snippet middle_right()}
		<Window class="editorBox" title="Carinvores" width=300px height=200px resizable={false} moveable={false}/>
		<Window class="editorBox" title="Herbivores" width=300px height=200px resizable={false} moveable={false}/>	
		<Window class="editorBox" title="Plants" width=300px height=200px resizable={false} moveable={false}/>			
	{/snippet}
    {#snippet bottom_center()}
        <div id="simulation" class="editorBox">
            <!-- Row 1: Timer Display -->
            <div class="timer-display">
                {formattedTime()}
            </div>
            
            <!-- Row 2: Speed Controls - Redesigned -->
            <div class="speed-control-wrapper">
                <button class="btn btn-speed" on:click={decreaseSpeed} title="Decrease Speed">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19,13H5v-2h14V13z" />
                    </svg>
                </button>
                
                <div class="speed-indicator">×{simulationSpeed}</div>
                
                <button class="btn btn-speed" on:click={increaseSpeed} title="Increase Speed">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19,13H13v6h-2v-6H5v-2h6V5h2v6h6V13z" />
                    </svg>
                </button>
            </div>
            
            <!-- Row 3: Play/Pause and Stop -->
            <div class="playback-controls">
                <button class="btn btn-icon btn-stop" on:click={stopSimulation} title="Stop Simulation">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <rect x="6" y="6" width="12" height="12" />
                    </svg>
                </button>
                
                <button class="btn btn-icon btn-play" on:click={togglePlay} title={isPlaying ? "Pause" : "Play"}>
                    {#if isPlaying}
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <rect x="6" y="4" width="4" height="16" />
                            <rect x="14" y="4" width="4" height="16" />
                        </svg>
                    {:else}
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <polygon points="5,3 19,12 5,21" />
                        </svg>
                    {/if}
                </button>
            </div>
        </div>
    {/snippet}
</Grid>