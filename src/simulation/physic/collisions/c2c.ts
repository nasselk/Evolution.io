import { type Vector } from "../../../math/vector.js";

import { type Collider } from "../collider.js";



function detection(circle1: Collider, circle2: Collider, offset: number = 0): [ Vector, number, number ] | void {
	const minDistance = circle1.size.x / 2 + circle2.size.x / 2 + offset;


	const delta = circle1.position.clone.subtract(circle2.position);

	const distance = delta.magnitude;


	if (distance < minDistance) {
		return [
			delta,
			distance,
			minDistance
		];
	}
}



function resolution(circle1: Collider, circle2: Collider): boolean {
	const colliding = detection(circle1, circle2);

	if (colliding) {
		const [ deltaPosition, distance, minDistance ] = colliding;


		if (distance === 0) {
			deltaPosition.set(1, 0);
		}


		// Resolve the overlap
		const overlap = minDistance - distance;

		const normal = deltaPosition.normalize();


		// Calculate inverse masses (static objects get 0 inverse mass)
		const inverseMass1 = 1 / circle1.entity.mass;
		const inverseMass2 = 1 / circle2.entity.mass;

		const totalInverseMass = inverseMass1 + inverseMass2;

		// Calculate the correction
		const correction = normal.clone.scale(overlap);

		const correction1 = correction.clone.scale(inverseMass1 / totalInverseMass);
		const correction2 = correction.clone.scale(inverseMass2 / totalInverseMass);

		// Apply the correction
		circle1.position.add(correction1);
		circle2.position.subtract(correction2);


		// Transfer the momentum
		const deltaVelocity = circle1.velocity.clone.subtract(circle2.velocity);
		const relativeVelocity = deltaVelocity.dot(normal);

		
		// If they're not moving apart
		if (relativeVelocity <= 0) {
			const restitution = Math.min(circle1.restitution, circle2.restitution);

			// Calculate the impulse
			const magnitude = -(1 + restitution) * relativeVelocity / totalInverseMass;
			const impulse = normal.scale(magnitude);

			const impulse1 = impulse.clone.scale(inverseMass1);
			const impulse2 = impulse.clone.scale(inverseMass2);

			// Apply the impulse
			circle1.velocity.add(impulse1);
			circle2.velocity.subtract(impulse2);
		}

		return true;
	}

	else {
		return false;
	}
}



export { detection as c2cDetection, resolution as c2cResolution };