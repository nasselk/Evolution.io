type TimerCallback = (...args: any[]) => void;



class Timer {
	private static readonly list: Set<Timer> = new Set();

	
	private readonly callback: TimerCallback;
	private readonly precise: boolean;
	private readonly interval: boolean;
	private readonly params: any[];
	private next?: number;
	private timer?: any;


	public constructor(callback: TimerCallback, delay: number, precise: boolean = false, interval: boolean = false, ...params: any[]) {
		this.callback = callback;
		this.interval = interval;
		this.precise = precise;
		this.params = params;

		if (this.precise) {
			this.next = performance.now() + delay;

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


	public static runAll(now: number = performance.now()): void { // Run it at each frame/tick manually
		for (const timeout of Timer.list) {
			if (timeout.next! <= now) {
				timeout.callback(...timeout.params);

				if (!timeout.interval) {
					Timer.list.delete(timeout);
				}
			}
		}
	}


	public static clear(): void {
		Timer.list.clear();
	}


	public clear(): void {
		if (this.timer) {
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
	}
}



export { Timer };