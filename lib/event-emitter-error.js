'use strict';

class EventEmitterError extends Error {

	static get codes() {

		return {
			INVALID_EVENT: 1,
			INVALID_EVENT_PROPERTIES: 2,
			NO_SERVICE_NAME: 3,
			MS_CALL_ERROR: 4
		};

	}

	constructor(err, code) {
		super(err);
		this.message = err.message || err;
		this.code = code;
		this.name = 'EventEmitterError';
	}
}

module.exports = EventEmitterError;
