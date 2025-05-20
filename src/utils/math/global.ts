import { Vector } from "./vector";



// Return a value clamped between min and max
export function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(value, max));
}


export function getBoundingBox(width: number, height: number, angle: number): Vector {
	// Calculate the absolute values of the cosine and sine of the rotation angle
	const cos = Math.abs(Math.cos(angle));
	const sin = Math.abs(Math.sin(angle));

	// Calculate the width and height of the bounding box
	return new Vector(
		width * cos + height * sin,
		width * sin + height * cos,
	);
}


export function getRandomTrianglePoint(p1: Vector, p2: Vector, p3: Vector, random1: number = Math.random(), random2: number = Math.random()): Vector {
	const sqrtA = Math.sqrt(random1);

	const x = (1 - sqrtA) * p1.x + sqrtA * (1 - random2) * p2.x + sqrtA * random2 * p3.x;
	const y = (1 - sqrtA) * p1.y + sqrtA * (1 - random2) * p2.y + sqrtA * random2 * p3.y;

	return new Vector(x, y);
}



export function triangleArea(p1: Vector, p2: Vector, p3: Vector): number {
	return Math.abs((p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)) / 2);
}