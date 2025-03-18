const ticks = new Map<number, () => void>();

const channel = new MessageChannel();
channel.port1.start();


let count = 0;

channel.port1.addEventListener("message", function (event: MessageEvent) {
	const action = ticks.get(event.data);

	if (action) {
		action();
		ticks.delete(event.data);
	}
});


export function nextTick(callback: () => void) {
	const id = ++count % 1000;

	ticks.set(id, callback);

	channel.port2.postMessage(id);
}