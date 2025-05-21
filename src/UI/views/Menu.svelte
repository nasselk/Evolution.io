
<style>
    :root {
        /* Scientific ecosystem palette - unchanged */
        --primary: #2A9D8F;
        --primary-light: #4DB6AC;
        --primary-glow: rgba(42, 157, 143, 0.4);
        --accent: #E76F51;
        --accent-glow: rgba(231, 111, 81, 0.3);
        --dark: rgba(27, 38, 44, 0.85);
        --light: #F1FAEE;
        --glass-border: rgba(150, 150, 150, 0.2);
        --glass-bg: rgba(15, 28, 36, 0.65);
    }

    .container {
        padding: 3vmin 3.5vmin; /* More horizontal padding */
        max-width: 80vmin; /* Slightly narrower for better proportions */
        display: flex;
        flex-direction: column;
        gap: 1.2vmin; /* Slightly tighter vertical spacing */
        border-radius: 1.8vmin; /* More rounded corners for the container */
    }

    .header {
        margin: 0 0 0.5vmin; /* Less bottom margin */
        color: var(--light);
        font-size: 1.9rem; /* Slightly smaller */
        font-weight: 600;
        letter-spacing: 0.02em;
        text-align: center;
        text-shadow: 0 2px 4px rgba(0,0,0,0.4);
    }
    
    .subheader {
        margin: 0 0 2vmin;
        color: rgba(241, 250, 238, 0.7);
        font-size: 0.9rem; /* Slightly smaller */
        text-align: center;
    }

    #startButton {
        width: 100%;
        height: 5.5vmin; /* Slightly shorter button */
        background: var(--primary);
        color: white;
        font-size: 1.05rem;
        font-weight: 600;
        letter-spacing: 0.05em;
        border: none;
        border-radius: 1vmin; /* More rounded button */
        box-shadow: 0 0.3vmin 1vmin rgba(0, 0, 0, 0.3), 
                    inset 0 1px 0 rgba(255,255,255,0.15);
        cursor: pointer;
        transition: all 0.2s ease;
        margin: 1vmin 0;
    }

    #startButton:hover {
        background: var(--primary-light);
        box-shadow: 0 0.4vmin 1.2vmin rgba(0, 0, 0, 0.35), 
                    0 0 15px var(--primary-glow),
                    inset 0 1px 0 rgba(255,255,255,0.2);
    }

    #settings {
        padding: 1.5vmin 1vmin; /* Reduced padding */
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.2vmin; /* Slightly tighter spacing */
    }
    
    .paramGroup {
        margin-bottom: 0.8vmin; /* Reduced margin */
        padding-bottom: 0.8vmin; /* Reduced padding */
        border-bottom: 1px solid rgba(150, 150, 150, 0.1);
    }
    
    .paramTitle {
        color: var(--primary-light);
        font-weight: 600;
        font-size: 0.85rem;
        margin-bottom: 0.8vmin;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    #settings label {
        display: grid;
        grid-template-columns: 10vmin 1fr 7vmin; /* Slightly narrower label column */
        align-items: center;
        gap: 1vmin;
        padding: 0.4vmin 0; /* Reduced vertical padding */
    }

    #settings label span {
        color: var(--light);
        font-weight: 400;
        font-size: 0.9rem;
    }

    /* Range Input Styling */
    input[type="range"] {
        -webkit-appearance: none;
        height: 0.4vmin;
        background: rgba(150, 150, 150, 0.15);
        border-radius: 0.5vmin;
        backdrop-filter: blur(2px);
        -webkit-backdrop-filter: blur(2px);
        outline: none;
    }

    input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 1.6vmin; /* Slightly smaller thumb */
        height: 1.6vmin;
        border-radius: 50%;
        background: var(--primary);
        cursor: pointer;
        border: 2px solid rgba(255, 255, 255, 0.8);
        box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
        transition: all 0.2s ease;
    }

    input[type="range"]::-webkit-slider-thumb:hover {
        background: var(--primary-light);
        box-shadow: 0 0 12px var(--primary-glow);
    }

    /* Number Input Styling */
    input[type="number"] {
        width: 100%;
        height: 2.6vmin; /* Slightly shorter */
        background: rgba(15, 28, 36, 0.5);
        border: 1px solid rgba(150, 150, 150, 0.2);
        border-radius: 0.6vmin; /* More rounded */
        padding: 0 0.6vmin;
        color: white;
        font-weight: 500;
        font-size: 0.85rem; /* Slightly smaller */
        text-align: center;
        backdrop-filter: blur(3px);
        -webkit-backdrop-filter: blur(3px);
        transition: all 0.2s ease;
    }

    input[type="number"]:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 1px var(--primary-glow);
    }

    /* Toggle Switch */
    .toggle-switch {
        position: relative;
        width: 40px; /* Slightly smaller */
        height: 20px; /* Slightly smaller */
        grid-column: 2 / span 2;
        justify-self: start;
    }

    .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(15, 28, 36, 0.5);
        transition: .3s;
        border-radius: 34px;
        border: 1px solid rgba(150, 150, 150, 0.2);
    }

    .slider:before {
        position: absolute;
        content: "";
        height: 12px;
        width: 12px;
        left: 4px;
        top: 50%;
        transform: translateY(-50%); /* Fix vertical alignment */
        background: white;
        transition: .3s;
        border-radius: 50%;
    }

    input:checked + .slider {
        background: var(--accent);
    }

    input:checked + .slider:before {
        transform: translateX(20px) translateY(-50%); /* Maintain vertical alignment when toggled */
    }
</style>


<script lang="ts">
    import Grid from "../components/GridLayout.svelte";
    import Game from "../../game";
    
    // For syncing range and number inputs
    const syncInputs = (event) => {
        const input = event.target;
        const targetId = input.type === "range" ? input.id + "Value" : input.id.replace("Value", "");
        const target = document.getElementById(targetId);
        if (target) target.value = input.value;

		if (input.id.includes("herbivore")) {
			Game.config.entities.herbivore = parseInt(input.value);
		}

		else if (input.id.includes("carnivore")) {
			Game.config.entities.carnivore = parseInt(input.value);
		}

		else if (input.id.includes("plant")) {
			Game.config.entities.plant = parseInt(input.value);
		}

		else if (input.id.includes("mapWidth")) {
			Game.map.shape.dimensions.x = parseInt(input.value);
		}

		else if (input.id.includes("mapHeight")) {
			Game.map.shape.dimensions.y = parseInt(input.value);
		}

		else if (input.id.includes("turbo")) {
			Game.config.turbo = input.checked;
		}
    }
</script>


<Grid id="menu" gap=1vw middle_center_direction="column">
    {#snippet middle_center()}
        <div class="container editorBox">
            <h1 class="header">Evolution Simulation</h1>
            <p class="subheader">Configure ecosystem parameters to observe emergent behaviors</p>
            
            <div id="settings">
                <div class="paramGroup">
                    <div class="paramTitle">Population</div>
                    <label title="herbivore">
                        <span>Herbivores</span>
                        <input type="range" id="herbivoreRange" min="0" max="10000" value="5000" step="100" oninput={syncInputs}>
                        <input type="number" id="herbivoreRangeValue" min="0" max="20000" value="5000" oninput={syncInputs}>
                    </label>
                    
                    <label title="carnivore">
                        <span>Carnivores</span>
                        <input type="range" id="carnivoreRange" min="0" max="10000" value="2000" step="100" oninput={syncInputs}>
                        <input type="number" id="carnivoreRangeValue" min="0" max="20000" value="2000" oninput={syncInputs}>
                    </label>
                    
                    <label title="plant">
                        <span>Plants</span>
                        <input type="range" id="plantRange" min="0" max="5000" value="3000" step="100" oninput={syncInputs}>
                        <input type="number" id="plantRangeValue" min="0" max="20000" value="3000" oninput={syncInputs}>
                    </label>
                </div>
                
                <div class="paramGroup">
                    <div class="paramTitle">Performance</div>
                    <label title="turbo" class="toggle-label">
                        <span>Turbo mode</span>
                        <div class="toggle-switch">
                            <input type="checkbox" id="turboToggle">
                            <span class="slider"></span>
                        </div>
                    </label>
                </div>
                
                <button type="button" id="startButton" onclick={Game.startSimulation.bind(Game)}>START SIMULATION</button>
            </div>
        </div>
    {/snippet}
</Grid>