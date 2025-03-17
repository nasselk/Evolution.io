import countries from "../countries.json";

import { onConnect } from "./listeners";

import { type Socket } from "./socket";



type Server = {
	name: string;
	url: string;
	countryCode: keyof typeof countries;
	id: number;
	lat?: number;
	lon?: number;
	locked?: boolean;
}


type Servers = {
	[mode: string]: {
		[region: string]: Server[];
	};
}



// Calculate the distance between two points of the earth (haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
	const R = 6371; // Radius of the earth

	const dLat = (lat2 - lat1) * Math.PI / 180;

	const dLon = (lon2 - lon1) * Math.PI / 180;

	const a = 0.5 - Math.cos(dLat) / 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * (1 - Math.cos(dLon)) / 2;

	return R * 2 * Math.asin(Math.sqrt(a));
}



function closestServerByDistance(servers: Servers, gameMode: string, lat: number, lon: number): number {
	let closestServers: any[] = [];

	let shortestDistance: number = Infinity;

	for (const region of Object.values(servers[gameMode])) {
		for (const server of region) {
			if (!server.locked) {
				const distance = calculateDistance(lat, lon, server.lat!, server.lon!);

				if (distance < shortestDistance) {
					closestServers = [server];

					shortestDistance = distance;
				}

				else if (distance === shortestDistance) {
					closestServers.push(server);
				}
			}
		}
	}

	// Return a random server among the closest ones
	const index = Math.floor(Math.random() * closestServers.length);

	return closestServers[index];
}



async function closestServerByLatency(servers: Servers, gameMode: string): Promise<any> {
	return new Promise(resolve => {
		let resolved = false;

		for (const region of Object.values(servers[gameMode])) {
			for (const server of region) {
				fetchRecursive(server.url + "/ping", 5).then(() => {
					if (!resolved) {
						resolved = true;

						resolve(server);
					}
				});
			}
		}
	});
}



async function fetchRecursive(url: string, retries: number = 5): Promise<Response>  {
	try {
		const response = await fetch(url);
		if (!response.ok) throw new Error("Fetch failed");
		return response;
	} 
	
	catch (error) {
		if (retries > 0) {
			await new Promise(resolve => setTimeout(resolve, 1000));

			return fetchRecursive(url, retries - 1);
		}
		
		else {
			throw error;
		}
	}
};



async function connectToBestServer(socket: Socket, servers: Servers, gameMode: string, countryCode?: keyof typeof countries): Promise<void> {
	let bestServer;

	if (countryCode) {
		const coordinates = countries[countryCode];

		bestServer = closestServerByDistance(servers, gameMode, coordinates[0], coordinates[1]);
	}

	else {
		bestServer = await closestServerByLatency(servers, gameMode);
	}

	return switchServer(socket, bestServer);
}



async function switchServer(socket: Socket, server: Server, reconnectionDelay?: number): Promise<void> {
	return socket.connect(server, reconnectionDelay).then(() => {
		onConnect(socket);
	});
}



function getServerByID(servers: Servers, ID: number | string): any {
	for (const mode of Object.values(servers)) {
		for (const region of Object.values(mode)) {
			for (const server of region) {
				if (server.id == ID) {
					return server;
				}
			}
		}
	}
}



export { connectToBestServer, switchServer, closestServerByDistance, closestServerByLatency, getServerByID, type Server, type Servers };