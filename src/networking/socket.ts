import { clientEvents, serverEvents } from "../../../shared/connector";

import { error, log, warn } from "../../../shared/logger";

import { switchServer, type Server } from "./findServer";

import { Timeout } from "../../../shared/timers/timeout";

import { showMessage } from "../UI/interaction";

import { MsgReader } from "./reader";

import { MsgWriter } from "./writer";



type onConnectCallback = () => void;
type onDisconnectCallback = (event: Event) => void;
type onMessageCallback = (data: MsgReader) => void;
type onAnyCallback = (event: string, data: MsgReader) => void;
type onErrorCallback = (error: Event) => void;



class Socket {
	private socket?: WebSocket | WebTransport;
	private readonly listeners: (onMessageCallback | undefined)[];
	private unreliableWriter?: WritableStreamDefaultWriter;
	private reliableWriter?: WritableStreamDefaultWriter;
	public readyState: "connecting" | "open" | "closed";
	private connectionCallback?: onConnectCallback;
	private disconnectCallback?: onDisconnectCallback;
	private readonly protocol?: "TCP" | "UDP";
	private errorCallback?: onErrorCallback;
	private onAnyCallback?: onAnyCallback;
	private reconnectTimeout?: Timeout;
	private server?: Server;
	private url?: string;

	
	public constructor(protocol: "TCP" | "UDP", server?: Server) {
		this.listeners = new Array(Object.keys(serverEvents).length);
		this.readyState = "closed";
		this.protocol = protocol;
		this.server = server;

		if (server) {
			this.connect(server);
		}
	}


	public static buildMessage(event: keyof typeof clientEvents, data?: Uint8Array): Uint8Array {
		const buffer = new MsgWriter(1 + (data?.byteLength ?? 0));

		buffer.writeUint8(clientEvents[event].encoder);

		if (data) {
			buffer.append(data);
		}

		return buffer.bytes;
	}


	private async setupWebSocket(url: string, reconnectionDelay?: number): Promise<void> {
		return new Promise((resolve, reject) => {
			this.socket = new WebSocket(url);

			this.socket.binaryType = "arraybuffer";


			this.socket.addEventListener("open", () => {
				this.readyState = "open";

				log("CLIENT", "Connected to", this.url);

				if (this.connectionCallback) {
					this.connectionCallback();
				}

				resolve();
			});


			this.socket.addEventListener("message", (message: MessageEvent) => {
				this.handleData(message.data);
			});


			this.socket.addEventListener("error", (error: Event) => {
				if (this.errorCallback) {
					this.errorCallback(error);
				}

				reject(error);
			});


			this.socket.addEventListener("close", (event: CloseEvent) => {	
				if (this.disconnectCallback) {
					this.disconnectCallback(event);
				}

				this.reset();

				if (event.code === 1006) {
					reconnectionDelay = reconnectionDelay ?? (this.readyState === "open" ? 250 : 1000);

					this.reconnectTimeout = new Timeout(() => {
						this.reconnect(reconnectionDelay);
					}, reconnectionDelay);

					error("CLIENT", "Disconnected from server with code", event.code, event.reason);
				}

				else {
					log("CLIENT", "Disconnected from server with code", event.code, event.reason);
				}
			});
		});
	}


	private async setupWebTransport(url: string): Promise<void> {
		this.socket = new WebTransport(url);


		await this.socket.ready;


		// Connection
		this.readyState = "open";

		console.log("Connected to", this.url);

		if (this.connectionCallback) {
			this.connectionCallback();
		}


		// Listen for UDP datagrams
		const datagram = this.socket.datagrams;

		this.unreliableWriter = datagram.writable.getWriter();

		this.recieveDatagram(datagram.readable.getReader());

		// Listen for TCP streams
		const stream = await this.socket.createBidirectionalStream();

		this.reliableWriter = stream.writable.getWriter();

		this.recieveStream(stream.readable.getReader());
	}


	private handleData(binary: ArrayBuffer): void {
		const buffer = new MsgReader(binary);

		const event = buffer.readUint8();

		const listener = this.listeners[event];

		listener?.(buffer);

		if (this.onAnyCallback) {
			this.onAnyCallback("event", new MsgReader(binary));
		}
	}


	private async recieveDatagram(reader: ReadableStreamDefaultReader<ArrayBuffer>): Promise<void> {
		while (true) {
			const { value, done } = await reader.read();

			if (done) {
				break;
			}

			this.handleData(value);
		}
	}


	private async recieveStream(reader: ReadableStreamDefaultReader<ArrayBuffer>): Promise<void> {
		while (true) {
			const { value, done } = await reader.read();

			if (done) {
				break;
			}

			this.handleData(value);
		}
	}


	public onConnect(callback: onConnectCallback): void {
		this.connectionCallback = callback;
	}


	public onError(callback: onErrorCallback): void {
		this.errorCallback = callback;
	}


	public onDisconnect(callback: onDisconnectCallback): void {
		this.disconnectCallback = callback;
	}


	public emit(event: keyof typeof clientEvents, data?: Uint8Array, reliable: boolean = true): void {
		const buffer = Socket.buildMessage(event, data);


		if (this.readyState === "open") {
			if (this.socket instanceof WebSocket) {
				this.socket.send(buffer);
			}

			else if (this.socket instanceof WebTransport) {
				if (reliable) {
					const writer = this.reliableWriter;

					writer?.write(buffer);
				}

				else {
					const writer = this.unreliableWriter;

					writer?.write(buffer);
				}
			}
		}
	}


	public on(event: keyof typeof serverEvents, callback: onMessageCallback): void {
		this.listeners[serverEvents[event].encoder] = callback;
	}


	public onAny(callback: onAnyCallback): void {
		this.onAnyCallback = callback;
	}


	public async connect(server: Server, reconnectionDelay?: number): Promise<void> {
		this.socket?.close();


		this.readyState = "connecting";

		this.server = server;

		this.url = server.url;


		if (this.protocol === "TCP") {
			const url = this.url.replace("http", "ws");

			return this.setupWebSocket(url, reconnectionDelay);
		} 
		
		else if (this.protocol === "UDP") {
			return this.setupWebTransport(this.url);
		}
	}


	private reset(): void {
		this.readyState = "closed";

		this.listeners.fill(undefined);

		this.connectionCallback = undefined;
		this.disconnectCallback = undefined;
		this.errorCallback = undefined;
		this.onAnyCallback = undefined;

		this.reconnectTimeout?.clear();
	}


	public close(): void {
		this.readyState = "closed";

		this.socket?.close();
	}


	public async reconnect(delay?: number): Promise<void> {
		warn("CLIENT", "Connection lost, trying to reconnect");

		showMessage("Connection lost, reconnecting", "error");

		return switchServer(this, this.server!, delay);
	}
}



export { Socket };