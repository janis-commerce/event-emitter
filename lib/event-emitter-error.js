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

		const message = err.message || err;

		super(message);
		this.message = message;
		this.code = code;
		this.name = 'EventEmitterError';

		if(err instanceof Error)
			this.previousError = err;
	}
}

module.exports = EventEmitterError;
