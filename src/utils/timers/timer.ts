type TimerCallback<T extends any[] = any[]> = (...args: T) => void;


class Timer<T extends any[] = any[]> {
	private static readonly list: Set<Timer> = new Set();

	
	private readonly callback: TimerCallback;
	private readonly precise: boolean;
	private readonly interval: boolean;
	private readonly delay: number;
	private readonly params: T;
	private start: number;
	private timer?: any;
	private paused: boolean;
	private pausedAt?: number;
	private activeTime: number;


	public constructor(callback: TimerCallback, delay: number, interval: boolean = false, eventLoop: boolean = true, ...params: T) {
		this.start = performance.now();
		this.callback = callback;
		this.interval = interval;
		this.precise = eventLoop;
		this.params = params;
		this.delay = delay;
		this.paused = false;
		this.activeTime = 0;

		if (this.precise) {
			Timer.list.add(this);
		}

		else {
			if (this.interval) {
				this.timer = setInterval(this.callback, delay, ...this.params);
			}

			else {
				this.timer = setTimeout(this.callback, delay);
			}
		}
	}


	public static runAll(now: number = performance.now(), timeScale: number = 1): void { // Run it at each frame/tick manually
		for (const timeout of Timer.list) {
			if (now - timeout.start >= timeout.delay / timeScale) {
				timeout.callback(...timeout.params);

				if (!timeout.interval) {
					Timer.list.delete(timeout);
				}

				else {
					timeout.start = now;
				}
			}
		}
	}


	public static clear(): void {
		Timer.list.clear();
	}


	public pause(): void {
		if (!this.paused) {
			this.paused = true;
			this.pausedAt = performance.now();

			if (!this.precise) {
				if (this.interval) {
					clearInterval(this.timer);
				} else {
					clearTimeout(this.timer);
				}
			}
		}
	}


	public resume(): void {
		if (this.paused && this.pausedAt) {
			this.paused = false;
			this.activeTime += performance.now() - this.pausedAt;

			if (!this.precise) {
				const remaining = Math.max(0, this.delay - this.elapsedTime);
				
				if (this.interval) {
					this.timer = setInterval(this.callback, this.delay, ...this.params);
				} 
				
				else {
					this.timer = setTimeout(this.callback, remaining, ...this.params);
				}
			}
		}
	}


	public clear(): void {
		if (this.precise) {
			Timer.list.delete(this);
		}

		else {
			if (this.interval) {
				clearInterval(this.timer);
			}

			else {
				clearTimeout(this.timer);
			}
		}
	}


	private get elapsedTime(): number {
		if (this.paused && this.pausedAt) {
			return this.pausedAt - this.start + this.activeTime;
		}

		return performance.now() - this.start + this.activeTime;
	}


	public get remainingTime(): number {
		return this.delay - this.elapsedTime;
	}


	public get active(): boolean {
		return !this.paused && this.precise ? Timer.list.has(this) : this.timer !== undefined;
	}
}



export { Timer };