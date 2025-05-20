import { ThreadEvents } from "./events";



class Thread {
	private readonly path?: URL;
	private readonly thread: Worker | MessagePort | typeof self;
	private listeners: Map<ThreadEvents, (data: any) => void> = new Map();

	
	constructor(thread: string | MessagePort | Worker | typeof self) {
		if (typeof thread === "string") {
			this.path = new URL(thread, import.meta.url);
			this.thread = new Worker(this.path);
		}

		else {
			this.thread = thread;
		}

		this.listeners = new Map();
		
		this.init();
	}


	private init() {
		this.thread.addEventListener("message", (event: Event): void => {
			const [ message, data ] = (event as MessageEvent).data;

			const listener = this.listeners.get(message);

			listener?.(data);
		});
	}


	public on(event: ThreadEvents, listener: (data: any) => void): void {
		this.listeners.set(event, listener);
	}


	public send(event: ThreadEvents, data?: any, transferList?: any[]): void {
		const message = [ event, data ];

		if (transferList) {
			this.thread.postMessage(message, transferList);
		}

		else {
			this.thread.postMessage(message);
		}
	}


	public terminate(): void {
		if (this.thread instanceof Worker) {
			this.thread.terminate();
		}

		else if (this.thread instanceof MessagePort) {
			this.thread.close();
		}
	}
}



export { Thread };