import { readdir, readFile, writeFile, mkdir, copyFile, stat } from "fs/promises";

import { dirname, extname, join, relative } from "path";

import { createInterface } from "readline/promises";

import { exec, execSync } from "child_process";



const input = createInterface({
	input: process.stdin,
	output: process.stdout
});



async function buildServer(path, type, version) {
	log(`Building ${type} server...`);


	try {

		execSync("npx tsc --sourceMap false", { cwd: path, stdio: "inherit" });
	}

	catch {
		log(`Failed to build ${type} server.`);
	}
	await updateConfig(`./production/${path}/config.json`, version);

	updateConfig(`./${path}/config.json`, version, false);

	copyFiles(`./${path}`);
}


async function buildClient(version) {
	try {
		log("Building client...");

		await updateConfig("./client/src/config.json", version);

		execSync("npm run build", { cwd: "./client", stdio: "inherit" });

		await updateConfig("./client/src/config.json", version, false);
	}

	catch (error) {
		log("Failed to build client:", error);
	}
}


async function updateConfig(path, version, production = true) {
	const file = await readFile(path, "utf-8");
	const config = JSON.parse(file);

	config.gameVersion = version;

	if (production) {
		config.ENV = "production";
		config.debug = false;

		if ("TLS" in config) {
			config.TLS = true;
		}
	}

	else {
		config.ENV = "development";

		if ("TLS" in config) {
			config.TLS = false;
		}
	}

	await writeFile(path, JSON.stringify(config, null, "\t"), "utf-8");
}


async function main() {
	const version = await input.question("What version do you want to deploy? : ");
	const commit = await input.question("\nCommit message : ");
	const deploy = await input.question("\nDo you want to deploy the app? (yes/no) : ");


	input.close();


	// Update the version
	//execSync(`npm version ${ version }`, { stdio: "inherit" });
	//execSync(`npm version ${ version } --workspaces`, { stdio: "inherit" });


	await buildServer("server", "game", version);

	copyFile("./package.json", "./production/package.json");
	copyFiles("./shared");

	await buildServer("master", "master", version);

	await buildClient(version);


	// Push the to the dev branch (main)
	execSync("git add -A");
	execSync(`git commit -m "${commit}"`, { stdio: "inherit" });
	exec("git push origin main", { stdio: "inherit" });


	if (deploy === "yes" || deploy === "y") {
		execSync("git add -A", {
			stdio: "inherit",
			cwd: "./production"
		});

		execSync(`git commit --allow-empty -m "${commit}"`, {
			stdio: "inherit",
			cwd: "./production"
		});

		execSync("git push --force origin production", { stdio: "inherit" });
	}
}



async function copyFiles(source, destination = "./production", base = dirname(source)) {
	const files = await readdir(source);

	for (const file of files) {
		const filePath = join(source, file);
		const stats = await stat(filePath);

		if (stats.isDirectory()) {
			if (file !== "node_modules") {
				return copyFiles(filePath, destination, base);
			}
		}

		else {
			const extension = extname(file);

			if (![".json", ".js", ".ts", ".sql"].includes(extension) || file === "package.json") {
				const relativePath = relative(base, filePath);
				const dest = join(destination, relativePath);

				await mkdir(dirname(dest), { recursive: true });

				copyFile(filePath, dest);
			}
		}
	}
}



function log(...args) {
	const now = new Date();
	const date = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${now.toLocaleTimeString()}`;

	const dateFormatted = `\x1b[42m\x1b[30m${date}\x1b[0m`;
	const emitterFormatted = "\x1b[36mBuilder\x1b[0m";

	console.log(`\n${dateFormatted} ${emitterFormatted} |`, ...args);
}



main().catch(error => log("An error occurred:", error));