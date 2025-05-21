// Get a random angle
export function randomAngle(): number {
	return Math.random() * 2 * Math.PI;
}

// Get a random angle in a range
export function getRandomAngle(minAngle: number, maxAngle: number): number {
	return Math.random() * (maxAngle - minAngle) + minAngle;
}

// Get distance between two angles
export function getAngleDistance(angle1: number, angle2: number): number {
	const distance = Math.abs(normalizeAngle(angle1 - angle2));

	return Math.min(distance, 2 * Math.PI - distance);
}

// Normalize an angle to be in range [0, 2π]
export function normalizeAngle(angle: number): number {
	const circumferance = 2 * Math.PI;

	if (angle >= 0 && angle < circumferance) {
		return angle;
	}

	return ((angle % circumferance) + circumferance) % circumferance;
}

// Get the opposite angle
export function getOppositeAngle(angle: number): number {
	return (angle + Math.PI) % (2 * Math.PI);
}


// Conversion
export function degreesToRadians(degrees: number): number {
	const radians = degrees * (Math.PI / 180);

	return radians;
}

export function radiansToDegrees(radians: number): number {
	const degrees = radians * (180 / Math.PI);

	return degrees;
}


// Return the closest angle to the reference angle
export function closestAngle(reference: number, ...angles: number[]): number {
	reference = normalizeAngle(reference);

	let closest = angles[0];
	let distance = getAngleDistance(reference, closest);

	for (let i = 1; i < angles.length; i++) {
		const newDistance = getAngleDistance(reference, angles[i]);

		if (newDistance < distance) {
			closest = angles[i];
			distance = newDistance;
		}
	}

	return closest;
}