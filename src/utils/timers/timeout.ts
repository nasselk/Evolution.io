type FrameTimeout = { callback: (..._args: any[]) => void, endTime: number, params: any[] };



class Timeout {
	static readonly list: Set<FrameTimeout> = new Set();

	private readonly precise: boolean;
	private readonly callback: any;
	private readonly params: any[];
	private timeout?: any;


	public constructor(callback: (..._args: any[]) => void, delay: number, precise: boolean = false, ...params: any[]) {
		this.precise = precise;
		this.callback = callback;
		this.params = params;

		if (this.precise) {
			this.timeout = { callback, endTime: performance.now() + delay, params: params };

			Timeout.list.add(this.timeout);
		}

		else {
			this.timeout = setTimeout(() => {
				this.timeout = null;

				this.callback(...this.params);
			}, delay);
		}
	}


	public static runTimeouts(now: number): void { // Run it at each frame/tick
		for (const timeout of Timeout.list) {
			if (timeout.endTime <= now) {
				timeout.callback(...timeout.params);

				Timeout.list.delete(timeout);
			}
		}
	}


	public clear(): void {
		if (this.timeout) {
			if (this.precise) {
				Timeout.list.delete(this.timeout);

				this.timeout = null;
			}

			else {
				clearTimeout(this.timeout);

				this.timeout = null;
			}
		}
	}
}



export { Timeout };