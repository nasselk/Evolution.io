import { Vector } from "./vector";

class Polygon {
	public readonly points: Vector[];

	public constructor(x: number, y: number, width: number, height: number, offset?: number, scale?: number);
	public constructor(shape: Vector[], offset?: number, scale?: number);
	public constructor(a: number | Vector[], b?: number, c?: number, d?: number, e?: number, f?: number) {
		if (Array.isArray(a)) {
			// (shape, offset?, scale?)
			this.points = a;

			this.init(b, c);
		} else {
			//(x, y, width, height, offset?, scale?)
			this.points = [];

			this.fromRectangle(a, b, c, d);

			this.init(e, f);
		}
	}

	public static union(...polygons: Polygon[]): Polygon {
		const allPoints: Vector[] = [];

		// Gather all vertices from the provided polygons
		polygons.forEach((poly) => allPoints.push(...poly.points));

		// If there are no points, return an empty polygon
		if (allPoints.length === 0) {
			return new Polygon([]);
		}

		// Find the starting point (lowest y, then lowest x)
		let start: Vector = allPoints[0];
		for (const p of allPoints) {
			if (p.y < start.y || (p.y === start.y && p.x < start.x)) {
				start = p;
			}
		}

		// Sort points by polar angle with respect to start.
		const sorted = allPoints.slice();
		sorted.sort((a, b) => {
			const angleA = Math.atan2(a.y - start.y, a.x - start.x);
			const angleB = Math.atan2(b.y - start.y, b.x - start.x);
			return angleA - angleB;
		});

		// Build the convex hull using the Graham scan algorithm.
		const hull: Vector[] = [];
		for (const pt of sorted) {
			// Remove last point from hull while we turn clockwise or it's collinear.
			while (hull.length > 1 && cross(hull[hull.length - 2], hull[hull.length - 1], pt) <= 0) {
				hull.pop();
			}
			hull.push(pt);
		}

		return new Polygon(hull);
	}

	public *[Symbol.iterator](): IterableIterator<Vector> {
		for (const point of this.points) {
			yield point;
		}
	}

	public forEach(callback: (value: Vector, index?: number) => void): void {
		let i = 0;

		for (const value of this) {
			callback(value, i);

			i++;
		}
	}

	private init(offset: number = 0, scale: number = 1): void {
		for (let i = 0; i < this.points.length; i++) {
			const point = this.points[i];

			this.points[i] = new Vector(offset + point.x * scale, offset + point.y * scale);
		}
	}

	private fromRectangle(x: number = 0, y: number = 0, width: number = 0, height: number = 0): void {
		this.points.push(new Vector(x - width / 2, y - height / 2), new Vector(x + width / 2, y - height / 2), new Vector(x + width / 2, y + height / 2), new Vector(x - width / 2, y + height / 2));
	}

	public set(points: Vector[]): this {
		this.points.length = 0;

		this.points.push(...points);

		return this;
	}

	public add(point: Vector): this {
		this.points.push(point);

		return this;
	}

	public remove(): this {
		this.points.pop();

		return this;
	}

	public extrude(offset: number, apply: boolean = false): Polygon {
		if (offset === 0) return this;

		const effectiveOffset = Math.abs(offset);
		const n = this.points.length;
		const modified: Vector[] = [];

		// Precompute normals for each edge.
		// The normal is computed as (-dy, dx) then normalized.
		// For negative offset (shrink), we use the inward normal as-is.
		// For positive offset (extrude), we reverse it.
		const normals = this.points.map((point, i, arr) => {
			const next = arr[(i + 1) % n];

			const edge = next.clone.subtract(point);

			const normal = edge.normal;

			return normal.scale(-Math.sign(offset));
		});

		for (let i = 0; i < n; i++) {
			const curr = this.points[i];
			const prevIndex = (i - 1 + n) % n;

			// Offset current vertex using the normal from the previous edge.
			const p1 = curr.clone.add(normals[prevIndex].clone.scale(effectiveOffset));
			// Also compute the offset using the normal of the current edge.
			const p2 = curr.clone.add(normals[i].clone.scale(effectiveOffset));

			// Calculate the direction vectors for the original edges.
			const d1 = curr.clone.subtract(this.points[prevIndex]);
			const d2 = this.points[(i + 1) % n].clone.subtract(curr);

			const det = d1.cross(d2);

			if (Math.abs(det) < 1e-10) {
				modified.push(p1);
			} else {
				// Compute t such that intersection = p1 + t*d1.
				const diff = p2.clone.subtract(p1);
				const t = diff.cross(d2) / det;
				const intersect = p1.clone.add(d1.clone.scale(t));
				modified.push(intersect);
			}
		}

		if (apply) {
			this.points.length = 0;

			for (const point of modified) {
				this.points.push(point);
			}

			return this;
		}

		return new Polygon(modified);
	}

	public intersects(position: Vector, radius: number = 0): boolean {
		const n = this.points.length;

		let angleSum = 0;

		for (let i = 0; i < n; i++) {
			const p1 = this.points[i].clone.subtract(position);
			const p2 = this.points[(i + 1) % n].clone.subtract(position);

			angleSum += Math.atan2(p1.cross(p2), p1.dot(p2));
		}

		// If the circle center is inside the polygon, they overlap.
		if (Math.abs(angleSum) > Math.PI) return true;

		// Otherwise, check if any edge is closer than the radius.
		for (let i = 0; i < n; i++) {
			const a = this.points[i];
			const b = this.points[(i + 1) % n];

			if (position.distanceWithSegment(a, b) <= radius) {
				return true;
			}
		}

		return false;
	}

	public get center(): Vector {
		const center = new Vector();

		for (const point of this.points) {
			center.add(point);
		}

		center.divideBy(this.points.length);

		return center;
	}

	public get width(): number {
		let minX = Infinity;
		let maxX = -Infinity;

		for (const point of this.points) {
			if (point.x < minX) {
				minX = point.x;
			} else if (point.x > maxX) {
				maxX = point.x;
			}
		}

		return maxX - minX;
	}

	public get height(): number {
		let minY = Infinity;
		let maxY = -Infinity;

		for (const point of this.points) {
			if (point.y < minY) {
				minY = point.y;
			} else if (point.y > maxY) {
				maxY = point.y;
			}
		}

		return maxY - minY;
	}

	public get dimensions(): Vector {
		let minX = Infinity;
		let maxX = -Infinity;

		let minY = Infinity;
		let maxY = -Infinity;

		for (const point of this.points) {
			if (point.x < minX) {
				minX = point.x;
			} else if (point.x > maxX) {
				maxX = point.x;
			}

			if (point.y < minY) {
				minY = point.y;
			} else if (point.y > maxY) {
				maxY = point.y;
			}
		}

		return new Vector(maxX - minX, maxY - minY);
	}

	get clone(): Polygon {
		return new Polygon(this.points);
	}
}

/**
 * Computes the cross product of OA x OB
 * If the result is positive, then the sequence O, A, B makes a counter-clockwise turn.
 */
function cross(o: Vector, a: Vector, b: Vector): number {
	return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

export { Polygon };
