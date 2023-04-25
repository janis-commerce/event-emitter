'use strict';

const assert = require('assert');

const EventEmitterError = require('../lib/event-emitter-error');

describe('Event Emitter Error', () => {

	it('Should accept a message error and a code', () => {
		const error = new EventEmitterError('Some error', EventEmitterError.codes.INVALID_EVENT);

		assert.strictEqual(error.message, 'Some error');
		assert.strictEqual(error.code, EventEmitterError.codes.INVALID_EVENT);
		assert.strictEqual(error.name, 'EventEmitterError');
	});

	it('Should accept an error instance and a code', () => {

		const previousError = new Error('Some error');

		const error = new EventEmitterError(previousError, EventEmitterError.codes.INVALID_EVENT);

		assert.strictEqual(error.message, 'Some error');
		assert.strictEqual(error.code, EventEmitterError.codes.INVALID_EVENT);
		assert.strictEqual(error.name, 'EventEmitterError');
		assert.strictEqual(error.previousError, previousError);
	});
});
