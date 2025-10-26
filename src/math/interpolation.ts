export function interpolate(start: number, end: number, factor: number = 0.05, deltaTime: number, limit?: number): number {
	const delta: number = end - start;

	if ((limit && Math.abs(delta) < limit) || globalThis.document?.hidden) {
		return end;
	}

	return start + delta * Math.min(factor * deltaTime, 1);
}

export function interpolateAngle(start: number, end: number, factor: number = 0.05, deltaTime: number, limit?: number): number {
	let delta: number = ((end - start + Math.PI) % (2 * Math.PI)) - Math.PI;

	while (delta < -Math.PI) {
		delta += 2 * Math.PI;
	}

	while (delta > Math.PI) {
		delta -= 2 * Math.PI;
	}

	if ((limit && Math.abs(delta) < limit) || document.hidden) {
		return end;
	}

	return start + delta * Math.min(1 - Math.pow(1 - factor, deltaTime), 1);
}
