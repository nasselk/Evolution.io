import { Vector } from "./vector";

export function getDistance(obj1: Vector, obj2: Vector): number {
	return Math.sqrt((obj1.x - obj2.x) ** 2 + (obj1.y - obj2.y) ** 2);
}

export function getDistanceSquared(obj1: Vector, obj2: Vector): number {
	return (obj1.x - obj2.x) ** 2 + (obj1.y - obj2.y) ** 2;
}

// Get a random integer between min and max
export function getRandomInt(min: number, max: number, random = Math.random.bind(Math)): number {
	return Math.floor(random() * (max - min + 1) + min);
}

// Select random point in a circle
export function getRandomCirclePoint(position: Vector, radius: number, random = Math.random.bind(Math)): Vector {
	const angle = random() * 2 * Math.PI;
	const distance = Math.sqrt(random()) * radius;

	return new Vector(angle, distance, true).add(position);
}
