import { getRandomTrianglePoint, triangleArea } from "../../../math/global";

import { Polygon } from "../../../math/polygon";

import { Vector } from "../../../math/vector";

import { IDAllocator } from "../../../utils/IDAllocator";

class Spawner {
	public readonly IDAllocator: IDAllocator;
	private seed: number;

	public constructor(seed: number) {
		this.IDAllocator = new IDAllocator();
		this.seed = seed;
	}

	public random() {
		const a = 1664525;
		const c = 1013904223;
		const m = 2 ** 32;

		this.seed = (a * this.seed + c) % m;

		return this.seed / m;
	}

	public randomInt(min: number, max: number) {
		return Math.floor(this.random() * (max - min + 1) + min);
	}

	public randomAngle() {
		return this.random() * Math.PI * 2;
	}

	public randomPosition(polygon: Polygon, offset: number = 0, random: () => number = this.random.bind(this)): Vector {
		// Shrink the polygon globally.
		const shrinked = polygon.extrude(-offset).points;

		// Triangulate the contracted polygon.
		const triangles: { p1: Vector; p2: Vector; p3: Vector }[] = [];
		const areas: number[] = [];
		let totalArea = 0;

		// Triangulate each part of the polygon using a fan triangulation.
		for (let i = 1; i < shrinked.length - 1; i++) {
			const p1 = shrinked[0];
			const p2 = shrinked[i];
			const p3 = shrinked[i + 1];

			const area = triangleArea(p1, p2, p3);

			triangles.push({ p1, p2, p3 });
			areas.push(area);

			totalArea += area;
		}

		let r = random() * totalArea;

		for (let i = 0; i < triangles.length; i++) {
			if (r < areas[i]) {
				return getRandomTrianglePoint(triangles[i].p1, triangles[i].p2, triangles[i].p3, this.random(), this.random());
			}

			r -= areas[i];
		}

		return shrinked[0];
	}
}

export { Spawner };
