class Vector {
	public static readonly null: Vector = new Vector();

	public x: number;
	public y: number;


	public constructor(x?: number, y?: number);
	public constructor(angle: number, length: number, polar: true);
	public constructor(a: number = 0, b: number = a, polar: boolean = false) {
		if (polar) {
			this.x = b * Math.cos(a);
			this.y = b * Math.sin(a);
		}

		else {
			this.x = a;
			this.y = b;
		}
	}


	public add(vector: Vector, scalar: number = 1): Vector {
		this.x += vector.x * scalar;
		this.y += vector.y * scalar;

		return this;
	}


	public subtract(vector: Vector, scalar: number = 1): Vector {
		this.x -= vector.x * scalar;
		this.y -= vector.y * scalar;

		return this;
	}


	public multiply(vector: Vector): Vector {
		this.x *= vector.x;
		this.y *= vector.y;

		return this;
	}


	public divide(vector: Vector): Vector {
		this.x /= vector.x;
		this.y /= vector.y;

		return this;
	}


	public scale(scalar: number): Vector {
		this.x *= scalar;
		this.y *= scalar;

		return this;
	}


	public divideBy(divisor: number): Vector {
		this.x /= divisor;
		this.y /= divisor;

		return this;
	}


	public dot(vector: Vector): number {
		return this.x * vector.x + this.y * vector.y;
	}


	public cross(vector: Vector): number {
		return this.x * vector.y - this.y * vector.x;
	}


	public normalize(clone: boolean = false): Vector {
		const magnitude: number = this.magnitude;

		if (clone) {
			return this.clone.divideBy(magnitude);
		}

		else {
			return this.divideBy(magnitude);
		}
	}


	public rotate(angle: number, point: Vector = Vector.null, clone: boolean = false) {
		const dx = this.x - point.x;
		const dy = this.y - point.y;

		const rotatedX = dx * Math.cos(angle) - dy * Math.sin(angle);
		const rotatedY = dx * Math.sin(angle) + dy * Math.cos(angle);

		if (clone) {
			return new Vector(rotatedX + point.x, rotatedY + point.y);
		}

		else {
			this.x = rotatedX + point.x;
			this.y = rotatedY + point.y;

			return this;
		}
	}


	public set(vector: Vector): Vector;
	public set(x: number, y?: number): Vector;
	public set(a: Vector | number, b: number = typeof a === "number" ? a : 0): Vector {
		if (a instanceof Vector) {
			this.x = a.x;
			this.y = a.y;
		}

		else {
			this.x = a;
			this.y = b;
		}

		return this;
	}


	public distanceWith(vector: Vector): number {
		const dx = this.x - vector.x;
		const dy = this.y - vector.y;

		return Math.sqrt(dx ** 2 + dy ** 2);
	}


	public distanceSquaredWith(vector: Vector): number {
		const dx = this.x - vector.x;
		const dy = this.y - vector.y;

		return dx ** 2 + dy ** 2;
	}


	public distanceWithSegment(p1: Vector, p2: Vector): number {
		const dp = p2.clone.subtract(p1);

		const v = this.clone.subtract(p1);
		let t = v.dot(dp) / dp.magnitudeSquared;
		t = t < 0 ? 0 : (t > 1 ? 1 : t);   

		const projection = p1.clone.add(dp.scale(t));

		return this.distanceWith(projection);
	}


	public angleWith(vector: Vector): number {
		const dx = vector.x - this.x;
		const dy = vector.y - this.y;

		return Math.atan2(dy, dx);
	}


	public equals(vector: Vector): boolean {
		return this.x === vector.x && this.y === vector.y;
	}


	public get clone(): Vector {
		return new Vector(this.x, this.y);
	}


	public get normal(): Vector {
		const vector = new Vector(-this.y, this.x);

		return vector.normalize();
	}


	public get magnitude(): number {
		return Math.sqrt(this.x ** 2 + this.y ** 2);
	}


	public get magnitudeSquared(): number {
		return this.x ** 2 + this.y ** 2;
	}


	public get angle(): number {
		return Math.atan2(this.y, this.x);
	}
}



export { Vector };