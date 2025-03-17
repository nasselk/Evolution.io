type FrameInterval = { callback: (..._args: any[]) => void, next: number, interval: number, params: any[] };



class Interval {
	static readonly list: Set<FrameInterval> = new Set();

	private readonly precise: boolean;
	private readonly callback: any;
	private readonly params: any[];
	private interval: any;


	public constructor(callback: (..._args: any[]) => void, interval: number, precise: boolean = false, ...params: any[]) {
		this.precise = precise;
		this.callback = callback;
		this.params = params;

		if (this.precise) {
			this.interval = { callback, next: performance.now() + interval, interval: interval, params: params };

			Interval.list.add(this.interval);
		}

		else {
			this.interval = setInterval(() => {
				this.callback(...this.params);
			}, interval);
		}
  	}


	public static runIntervals(now: number): void { // Run it at each frame/tick
		for (const interval of Interval.list) {
			if (interval.next <= now) {
				interval.callback(...interval.params);

				interval.next = now + interval.interval;
			}
		}
	}


	public clear(): void {
		if (this.interval) {
			if (this.precise) {
				Interval.list.delete(this.interval);

				this.interval = null;
			}

			else {
				clearInterval(this.interval);

				this.interval = null;
			}
		}
	}
}



export { Interval };