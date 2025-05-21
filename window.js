import electron, { globalShortcut } from "electron";

const { app, BrowserWindow, net } = electron;

import { spawn } from "cross-spawn";

import treeKill from "tree-kill";



const devServer = spawn("npm", [ "run", "dev" ], { cwd: "./client" });


function viteReady(url, delay = 250) {
	return new Promise((resolve) => {
		const interval = setInterval(() => {
			const request = net.request(url);

			request.on("response", (response) => {
				if (response.statusCode >= 200 && response.statusCode < 300) {
					clearInterval(interval);
					resolve();
				}
			});


			request.on("error", () => {
				// Ignore errors and wait for the next retry
			});

			request.end();
		}, delay);
	});
}



async function createWindow() {
	app.on("window-all-closed", () => {
		if (process.platform !== "darwin") {
			app.quit();
		}
	});

	const engine = new BrowserWindow({
		//fullscreen: true,
		title: "Phoenix.Engine",
		backgroundColor: "#000000",
		backgroundMaterial: "none",
		autoHideMenuBar: true,
		icon: "./client/public/assets/logo.ico",
		webPreferences: {
			//backgroundThrottling: false,
			nodeIntegration: false,
			contextIsolation: true,
			sandbox: true,
		}
	});

	engine.maximize();

	globalShortcut.register("CommandOrControl+T", () => {
		engine.webContents.toggleDevTools();
	});	
	
	await viteReady("http://localhost:80");
	
	engine.loadURL("http://localhost:80");

	engine.on("closed", () => {
		console.log("Window closed.");

		treeKill(devServer.pid, "SIGKILL", function() {
			//engine.destroy();

			//app.quit();
		});

		console.log("Window closed 2.");

	});	
}



app.commandLine.appendSwitch("disable-infobars");                // Disable infobars
app.commandLine.appendSwitch("disable-sync");                    // Disable syncing
app.commandLine.appendSwitch("disable-translate");               // Disable translate
app.commandLine.appendSwitch("disable-background-networking");   // Disable background networking
app.commandLine.appendSwitch("disable-renderer-backgrounding");  // Already used
app.commandLine.appendSwitch("disable-accelerated-2d-canvas");     // Already used
//app.commandLine.appendSwitch("disable-ipc-flooding-protection");   // Reduce IPC overhead
// You can experiment with:
app.commandLine.appendSwitch("ignore-gpu-blacklist");         // Always use GPU acceleration
app.commandLine.appendSwitch("enable-zero-copy");             // Optimize image rendering

//app.commandLine.appendSwitch("disable-background-timer-throttling"); // Already used



app.whenReady().then(createWindow);