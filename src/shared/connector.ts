import types from "./entities";



function pair<T extends string>(list: readonly T[], start: number = list.length): [{ [key: number]: T }, { [key in T]: number }] {
	const IN: { [key: number]: T } = {};
	const OUT = {} as { [key in T]: number };

	for (let i: number = 0; i < list.length; i++) {
		const index = start - list.length + i;

		OUT[list[i] as T] = index;

		IN[index] = list[i];
	}

	return [ IN, OUT ];
}



const [ TYPES_MARKERS_IN, TYPES_MARKERS_OUT ] = pair<keyof typeof types>(Object.keys(types) as (keyof typeof types)[]);


export function getTypeDecoder(a: number): keyof typeof types {
	return TYPES_MARKERS_IN[a];
}

export function getTypeEncoder(a: keyof typeof types): number {
	return TYPES_MARKERS_OUT[a];
}



// Types stuff
const entityTypes: { readonly [key in keyof typeof types]: Set<string> } = {} as any;

for (const type in types) {
	(entityTypes as any)[type] = new Set();

	for (const [ key, value ] of Object.entries(types[type as keyof typeof types])) {
		if (value === true) {
			entityTypes[type as keyof typeof types].add(key);
		}
	}
}



const dynamicTypes = new Set<keyof typeof types>(
	Object.keys(types).filter(type => types[type as keyof typeof types].dynamic === true) as Array<keyof typeof types>
);



export { entityTypes, dynamicTypes };