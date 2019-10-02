'use strict';

const assert = require('assert');
const sandbox = require('sinon').createSandbox();
const MicroserviceCall = require('@janiscommerce/microservice-call');

const EventEmitter = require('./../index');
const EventEmitterError = require('./../lib/event-emitter-error');

describe('EventEmitter', () => {

	beforeEach(() => {
		sandbox.restore();
	});

	describe('_validateEvent()', () => {

		it('should not throw when the received event is correct', () => {

			const event = {
				entity: 'some-entity',
				event: 'some-event',
				client: 'some-client',
				id: 1
			};

			assert.doesNotThrow(() => EventEmitter._validateEvent(event));
		});

		it('should throw when the received event is not an object', () => {
			assert.throws(() => EventEmitter._validateEvent('string'), {
				name: 'EventEmitterError',
				code: EventEmitterError.codes.INVALID_EVENT
			});
		});

		it('should throw when the received event is an array', () => {
			assert.throws(() => EventEmitter._validateEvent(['array']), {
				name: 'EventEmitterError',
				code: EventEmitterError.codes.INVALID_EVENT
			});
		});

		context('when the received event doesn\'t have the required fields', () => {

			it('should throw if event.entity not exists', () => {
				assert.throws(() => EventEmitter._validateEvent({ event: 'something' }), {
					name: 'EventEmitterError',
					code: EventEmitterError.codes.INVALID_EVENT_PROPERTIES
				});
			});

			it('should throw if event.event not exists', () => {
				assert.throws(() => EventEmitter._validateEvent({ entity: 'something' }), {
					name: 'EventEmitterError',
					code: EventEmitterError.codes.INVALID_EVENT_PROPERTIES
				});
			});
		});

		context('when there are bad types in the event properties', () => {

			const event = {
				event: 'some-event',
				entity: 'some-entity'
			};

			it('should throw if event.client exists but is not a string', () => {
				assert.throws(() => EventEmitter._validateEvent({ ...event, client: 1 }), {
					name: 'EventEmitterError',
					code: EventEmitterError.codes.INVALID_EVENT_PROPERTIES
				});
			});

			it('should throw if event.id exists but is not a number or string', () => {
				assert.throws(() => EventEmitter._validateEvent({ ...event, id: {} }), {
					name: 'EventEmitterError',
					code: EventEmitterError.codes.INVALID_EVENT_PROPERTIES
				});
			});
		});
	});

	describe('emit()', () => {

		it('should return true when MicroserviceCall.post responses with status code 200', async () => {

			const event = {
				entity: 'some-entity',
				event: 'some-event'
			};

			const msCallMock = sandbox.mock(MicroserviceCall.prototype).expects('post')
				.withExactArgs('events', 'event', 'emit', { ...event, service: 'some-service' })
				.returns({
					statusCode: 200
				});

			assert.deepStrictEqual(await EventEmitter.emit(event), true);

			msCallMock.verify();
		});

		it('should return false when MicroserviceCall.post without status code 200', async () => {

			const event = {
				entity: 'some-entity',
				event: 'some-event'
			};

			const msCallMock = sandbox.mock(MicroserviceCall.prototype).expects('post')
				.withExactArgs('events', 'event', 'emit', { ...event, service: 'some-service' })
				.returns({
					statusCode: 400
				});

			assert.deepStrictEqual(await EventEmitter.emit(event), false);

			msCallMock.verify();
		});

		it('should throw when MicroserviceCall.post rejects', async () => {

			const event = {
				entity: 'some-entity',
				event: 'some-event'
			};

			const msCallMock = sandbox.mock(MicroserviceCall.prototype).expects('post')
				.withExactArgs('events', 'event', 'emit', { ...event, service: 'some-service' })
				.rejects();

			await assert.rejects(EventEmitter.emit(event), {
				name: 'EventEmitterError',
				code: EventEmitterError.codes.MS_CALL_ERROR
			});

			msCallMock.verify();
		});

		it('should throw when service name env not exists', async () => {

			sandbox.stub(EventEmitter, '_serviceName').get(() => undefined);

			await assert.rejects(EventEmitter.emit({}), {
				name: 'EventEmitterError',
				code: EventEmitterError.codes.NO_SERVICE_NAME
			});
		});
	});

});
