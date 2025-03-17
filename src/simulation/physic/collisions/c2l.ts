import { Vector } from "../../../utils/math/vector";

import { type Collider } from "../collider";



function c2lCollision(circle: Collider, line: { p1: Vector, p2: Vector, restitution: number }): void {
	const normal = line.p2.clone.subtract(line.p1).normalize();
	const vector = circle.position.clone.subtract(line.p1);

	const distance = vector.dot(normal);
	const closest = line.p1.clone.add(normal.clone.scale(distance));


	// Check if the closest point is within the line segment
	const lineSegment = line.p2.clone.subtract(line.p1);
	const projection = closest.clone.subtract(line.p1).dot(lineSegment) / lineSegment.magnitudeSquared;


	if (projection < 0 || projection > 1) {
		return; // Closest point is outside the line segment
	}

	const diff = circle.position.clone.subtract(closest);
	const length = diff.magnitude;

	if (length <= circle.size.x / 2) {
		const overlap = circle.size.x / 2 - length;
		circle.position.add(diff.normalize().scale(overlap));

		const velocityNormal = circle.velocity.dot(normal);
		const reflection = normal.clone.scale(2 * velocityNormal).subtract(circle.velocity).scale(line.restitution);
		
		circle.velocity.set(reflection);
	}
}



export { c2lCollision };