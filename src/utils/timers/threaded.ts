const workerScript: string = `
    self.addEventListener("message", (event) => {
		const id = event.data;

        setTimeout(() => {
            self.postMessage(null);
        }, 1);
    });
`;


const blob = new Blob([workerScript], { type: "application/javascript" });
const workerUrl = URL.createObjectURL(blob);

class AccurateTimeout {
	public static readonly thread: Worker = new Worker(workerUrl);
	public static callback: any;

	constructor(callback: any) {
		AccurateTimeout.thread.postMessage(null);

		AccurateTimeout.callback = callback;
	}
}


AccurateTimeout.thread.addEventListener("message", () => {
	AccurateTimeout.callback();
});



export { AccurateTimeout };