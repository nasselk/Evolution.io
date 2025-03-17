import { getTypeDecoder, getUpdateDecoder, type updates } from "../../../shared/connector";

import { fromUint8Angle } from "../../../shared/utils/math/angle";

import { Entity, type EntityTypes } from "../entities/entity";

import { MsgReader } from "./reader";

import { game } from "../game";



type encoderName = typeof updates[number] | EntityTypes | "defaultPosition"

const updateDecoders: Map<encoderName, (reader: MsgReader, type: EntityTypes) => any> = new Map();


function setDecoder(update: encoderName, decoder: (reader: MsgReader, ...params: any[]) => any): void {
	updateDecoders.set(update, decoder);
}

function getDecoder(update: encoderName): (reader: MsgReader, ...params: any[]) => any {
	return updateDecoders.get(update)!;
}



setDecoder("createEntity", function (reader: MsgReader, type: EntityTypes): any {
	Entity.create(type, reader);
});


setDecoder("destroyEntity", function (reader: MsgReader): void {
	const id = reader.readUint16();

	Entity.get(id)?.destroy();
});


setDecoder("becomeStatic", function (data: MsgReader): void {
	const id = data.readUint16();

	const entity = game.entities.get(id);

	if (entity) {
		entity.moving = false;
	}
});


setDecoder("becomeDynamic", function (data: MsgReader): void {
	const id = data.readUint16();

	const entity = game.entities.get(id);

	if (entity) {
		entity.moving = true;
	}
});


setDecoder("position", function(reader: MsgReader): any {
	const id = reader.readBit(13) as number;

	const entity = Entity.get(id);

	if (entity && getDecoder(entity.type)) {
		getDecoder(entity.type)(reader, entity);
	}

	else {
		getDecoder("defaultPosition")(reader, entity);
	}
});


setDecoder("defaultPosition", function(reader: MsgReader, entity?: Entity): void {
	const update: any = {};

	const hasX = reader.readBit();
	const hasY = reader.readBit();
	const hasAngle = reader.readBit();

	if (hasX) {
		update.x = MsgReader.fromPrecision(reader.readUint16(), game.map.bounds.max.x, 16);
	}

	if (hasY) {
		update.y = MsgReader.fromPrecision(reader.readUint16(), game.map.bounds.max.y, 16);
	}

	if (hasAngle) {
		update.angle = fromUint8Angle(reader.readUint8());
	}

	entity?.update(update);
});




let previousPositionUpdate: number = performance.now();
let lastPositionUpdate: number = previousPositionUpdate;

//DecodeWorldState is used to interpretate a set of merged updates from the server
//ex: there the world state (that's the main update as best is to try to merge all updates in this one)
// you can add more decoders if you want to interpretate other updates

function decodeWorldState(reader: MsgReader): void {
	let event: typeof updates[number];

	let type: EntityTypes | undefined;


	while (reader.offset < reader.byteLength) {
		if (getUpdateDecoder(reader.readUint16(false)) != undefined) { // If the next data is an update marker
			event = getUpdateDecoder(reader.readUint16());

			if (event === "position") {
				previousPositionUpdate = lastPositionUpdate;

				lastPositionUpdate = performance.now();
			}
		}

		if (reader.offset + 2 < reader.byteLength && getTypeDecoder(reader.readUint16(false)) != undefined) { // If the next data is a type marker
			type = getTypeDecoder(reader.readUint16());
		}


		getDecoder(event!)?.(reader, type); // Call the update decoder for the event with possible type


		// Flags aren't merged between different updates within the world update
		reader.lastFlagIndex = 0;
	}
};



export { decodeWorldState, lastPositionUpdate, previousPositionUpdate };