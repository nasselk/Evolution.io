function formattedDate(): string {
	const now = new Date();

	return `\x1b[42m\x1b[30m${ now.getFullYear() }-${ now.getMonth() + 1 }-${ now.getDate()} ${ now.toLocaleTimeString() }\x1b[0m`;
}


function formattedSource(source: string): string {
	return `\x1b[36m${ source }\x1b[0m`;
}


function log(source: string, ...messages: any[]): void {
	const date = formattedDate();

	const emitter = formattedSource(source);

	console.log(`${ date } ${ emitter } |`, ...messages);
}


function warn(source: string, ...messages: any[]): void {
	const date = formattedDate();

	const warn = "\x1b[43m\x1b[30mWARN\x1b[0m";

	const emitter = formattedSource(source);

	console.warn(`${ date } ${ warn } ${ emitter } |`, ...messages);
}


function error(source: string, ...messages: any[]): void {
	const date = formattedDate();

	const error = "\x1b[41m\x1b[30mERROR\x1b[0m";

	const emitter = formattedSource(source);

	console.error(`${ date } ${ error } ${ emitter } |`, ...messages);
}



function credit(source: string, ...messages: string[]): void {
	const date = formattedDate();

	const credit = "\x1b[45m\x1b[30mPHOENIX.ENGINE\x1b[0m";

	const emitter = formattedSource(source);

	console.log(`${ date } ${ credit } ${ emitter } | Powered by Phoenix.Engine`, ...messages);
}



export { log, warn, error, credit };