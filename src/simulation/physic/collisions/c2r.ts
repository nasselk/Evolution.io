import { type DynamicEntity } from "../../entities/dynamicEntity";

import { Vector } from "../../../utils/math/vector";

import { type Collider } from "../collider";



function detection(circle: Collider, rectangle: Collider, offset: number = 0): [ Vector, number, Vector ] | void {
	const delta = circle.position.clone.subtract(rectangle.position).rotate(-rectangle.entity.angle);


	// Find the closest point on the rectangle to the circle
	const closest = new Vector(
		Math.max(-rectangle.size.x / 2, Math.min(delta.x, rectangle.size.x / 2)),
		Math.max(-rectangle.size.y / 2, Math.min(delta.y, rectangle.size.y / 2))
	);


	// Distance between circle and closest point
	const distanceVector = delta.subtract(closest);
	const distance = distanceVector.magnitude;


	if (distance < circle.size.x / 2 + offset) {
		return [
			distanceVector,
			distance,
			closest,
		];
	}
}



function resolution(circle: Collider, rectangle: Collider): boolean {
	const colliding = detection(circle, rectangle);

	// Collision detection
	if (colliding) {
		const [ deltaPosition, distance, closest ] = colliding;


		if (distance === 0) {
			deltaPosition.set(1, 0);
		}


		// Resolve the overlap
		const overlap = circle.size.x / 2 - distance;

		const normal = deltaPosition.normalize();


		// Calculate inverse masses (static objects get 0 inverse mass)
		const inverseMass1 = 1 / circle.entity.mass;
		const inverseMass2 = 1 / rectangle.entity.mass;

		const totalInverseMass = inverseMass1 + inverseMass2;

		// Calculate the correction
		const correction = normal.clone.scale(overlap).rotate(rectangle.entity.angle);

		const correction1 = correction.clone.scale(inverseMass1 / totalInverseMass);
		const correction2 = correction.clone.scale(inverseMass2 / totalInverseMass);

		// Apply the correction
		circle.position.add(correction1);
		rectangle.position.subtract(correction2);


		// Transfer the momentum
		const deltaVelocity = circle.velocity.clone.subtract(rectangle.velocity).rotate(-rectangle.entity.angle);

		const relativeVelocity = deltaVelocity.dot(normal);


		// If they're not moving apart
		if (relativeVelocity <= 0) {
			const restitution = Math.min(circle.restitution, rectangle.restitution);

			// Calculate the impulse
			const magnitude = -(1 + restitution) * relativeVelocity / totalInverseMass;
			const impulse = normal.scale(magnitude).rotate(rectangle.entity.angle);

			const impulse1 = impulse.clone.scale(inverseMass1);
			const impulse2 = impulse.clone.scale(inverseMass2);

			// Apply the impulse
			circle.velocity.add(impulse1);
			rectangle.velocity.subtract(impulse2);


			// Torque
			if (rectangle.entity.mass < Infinity) {
				const contactPointWorld = closest.rotate(rectangle.entity.angle).add(rectangle.position);
				const leverArm = contactPointWorld.subtract(rectangle.position);
				const torque = leverArm.cross(impulse);

				const momentOfInertia = (1 / 12) * rectangle.entity.mass * (rectangle.size.x ** 2 + rectangle.size.y ** 2);

				(rectangle.entity as DynamicEntity).angularVelocity -= torque * 3 / momentOfInertia;
			}
		}

		return true;
	}


	return false;
}



export { detection as c2rDetection, resolution as c2rResolution };