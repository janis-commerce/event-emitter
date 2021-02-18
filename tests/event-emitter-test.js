'use strict';

const assert = require('assert');
const sinon = require('sinon');
const MicroserviceCall = require('@janiscommerce/microservice-call');

const EventEmitter = require('./../lib/event-emitter');
const EventEmitterError = require('./../lib/event-emitter-error');

const setEnvVars = () => {
	process.env.JANIS_SERVICE_NAME = 'some-service';
};

const clearEnvVars = () => {
	delete process.env.JANIS_SERVICE_NAME;
};

describe('EventEmitter', () => {

	beforeEach(() => {
		setEnvVars();
		sinon.restore();
	});

	afterEach(() => {
		clearEnvVars();
	});

	describe('emit()', () => {

		describe('Event structure validations', () => {

			it('Should throw when the received event is not an object', async () => {
				await assert.rejects(EventEmitter.emit('string'), {
					name: 'EventEmitterError',
					code: EventEmitterError.codes.INVALID_EVENT
				});
			});

			it('Should throw when the received event is an array', async () => {
				await assert.rejects(EventEmitter.emit(['array']), {
					name: 'EventEmitterError',
					code: EventEmitterError.codes.INVALID_EVENT
				});
			});

			context('When the received event doesn\'t have the required fields', () => {

				it('Should throw if event.entity not exists', async () => {
					await assert.rejects(EventEmitter.emit({ event: 'something' }), {
						name: 'EventEmitterError',
						code: EventEmitterError.codes.INVALID_EVENT_PROPERTIES
					});
				});

				it('Should throw if event.event not exists', async () => {
					await assert.rejects(EventEmitter.emit({ entity: 'something' }), {
						name: 'EventEmitterError',
						code: EventEmitterError.codes.INVALID_EVENT_PROPERTIES
					});
				});
			});

			context('When there are bad types in the event properties', () => {

				const event = {
					event: 'some-event',
					entity: 'some-entity'
				};

				const assertRejects = async data => {
					await assert.rejects(EventEmitter.emit({ ...event, ...data }), {
						name: 'EventEmitterError',
						code: EventEmitterError.codes.INVALID_EVENT_PROPERTIES
					});
				};

				it('Should throw if event.client exists but is not a string', async () => {
					await assertRejects({ client: 1 });
					await assertRejects({ client: true });
					await assertRejects({ client: [123] });
					await assertRejects({ client: { foo: 'bar' } });
				});

				it('Should throw if event.id exists but is not a number or string', async () => {
					await assertRejects({ id: {} });
					await assertRejects({ id: true });
				});

				it('Should throw if event.id is an Array but not all the items are number or string', async () => {
					await assertRejects({ id: [1, 'some-id', { foo: 'bar' }] });
					await assertRejects({ id: [] });
				});
			});

		});

		it('Should call MicroserviceCall.call when the received event.client and event.id are valid', async () => {

			const msCallMock = sinon.mock(MicroserviceCall.prototype);

			['some-id', 1].forEach(async id => {

				const event = {
					id,
					client: 'some-client',
					entity: 'some-entity',
					event: 'some-event',
					service: 'some-service'
				};

				msCallMock.expects('call')
					.withExactArgs('events', 'event', 'emit', { ...event })
					.returns({
						statusCode: 200,
						body: {
							id
						}
					});

				assert.deepStrictEqual(await EventEmitter.emit(event), {
					result: true,
					response: {
						statusCode: 200,
						body: {
							id
						}
					}
				});

				msCallMock.verify();
			});
		});

		it('Should call MicroserviceCall.call when the received event has no client but id', async () => {

			const event = {
				id: 'some-id',
				entity: 'some-entity',
				event: 'some-event',
				service: 'some-service'
			};

			const msCallMock = sinon.mock(MicroserviceCall.prototype).expects('call')
				.withExactArgs('events', 'event', 'emit', { ...event })
				.returns({
					statusCode: 200,
					body: {
						id: event.id
					}
				});

			assert.deepStrictEqual(await EventEmitter.emit(event), {
				result: true,
				response: {
					statusCode: 200,
					body: {
						id: event.id
					}
				}
			});

			msCallMock.verify();
		});

		it('Should call MicroserviceCall.call when the received event has no id but client', async () => {

			const event = {
				client: 'some-client',
				entity: 'some-entity',
				event: 'some-event',
				service: 'some-service'
			};

			const msCallMock = sinon.mock(MicroserviceCall.prototype).expects('call')
				.withExactArgs('events', 'event', 'emit', { ...event })
				.returns({
					statusCode: 200,
					body: {
						id: 'the-event-id'
					}
				});

			assert.deepStrictEqual(await EventEmitter.emit(event), {
				result: true,
				response: {
					statusCode: 200,
					body: {
						id: 'the-event-id'
					}
				}
			});

			msCallMock.verify();
		});

		it('Should return true when MicroserviceCall.call responses with status code 200', async () => {

			const event = {
				entity: 'some-entity',
				event: 'some-event',
				service: 'some-service'
			};

			const msCallMock = sinon.mock(MicroserviceCall.prototype).expects('call')
				.withExactArgs('events', 'event', 'emit', { ...event })
				.returns({
					statusCode: 200,
					body: {
						id: 'the-event-id'
					}
				});

			assert.deepStrictEqual(await EventEmitter.emit(event), {
				result: true,
				response: {
					statusCode: 200,
					body: {
						id: 'the-event-id'
					}
				}
			});

			msCallMock.verify();
		});

		it('Should return false when MicroserviceCall.call without status code 200', async () => {

			const event = {
				entity: 'some-entity',
				event: 'some-event',
				service: 'some-service'
			};

			const msCallMock = sinon.mock(MicroserviceCall.prototype).expects('call')
				.withExactArgs('events', 'event', 'emit', { ...event })
				.returns({
					statusCode: 400,
					body: {
						message: 'Invalid event'
					}
				});

			assert.deepStrictEqual(await EventEmitter.emit(event), {
				result: false,
				response: {
					statusCode: 400,
					body: {
						message: 'Invalid event'
					}
				}
			});

			msCallMock.verify();
		});

		it('Should throw when MicroserviceCall.call rejects', async () => {

			const event = {
				entity: 'some-entity',
				event: 'some-event',
				service: 'some-service'
			};

			const msCallMock = sinon.mock(MicroserviceCall.prototype).expects('call')
				.withExactArgs('events', 'event', 'emit', { ...event })
				.rejects();

			await assert.rejects(EventEmitter.emit(event), {
				name: 'EventEmitterError',
				code: EventEmitterError.codes.MS_CALL_ERROR
			});

			msCallMock.verify();
		});

		it('Should throw when service name env not exists', async () => {

			clearEnvVars();

			await assert.rejects(EventEmitter.emit({}), {
				name: 'EventEmitterError',
				code: EventEmitterError.codes.NO_SERVICE_NAME
			});
		});
	});
});
