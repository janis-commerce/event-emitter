'use strict';

const MicroserviceCall = require('@janiscommerce/microservice-call');
const EventEmitterError = require('./event-emitter-error');

const JANIS_EVENTS_SERVICE = 'events';
const JANIS_EVENTS_NAMESPACE = 'event';
const JANIS_EVENTS_METHOD = 'emit';

/**
 * @class EventEmitter
 * @classdesc A package for emit events
 */
class EventEmitter {

	static get _serviceName() {
		return process.env.JANIS_SERVICE_NAME;
	}

	static get _eventsService() {
		return JANIS_EVENTS_SERVICE;
	}

	static get _eventsNamespace() {
		return JANIS_EVENTS_NAMESPACE;
	}

	static get _eventsMethod() {
		return JANIS_EVENTS_METHOD;
	}

	/**
	 * Validates the event properties
	 * @param {Object} event event properties
	 * @throws if any of the validations fails
	 */
	static _validateEvent(event) {

		// Should be an object (not array)
		if(typeof event !== 'object' || Array.isArray(event))
			throw new EventEmitterError('Invalid event: should be and object', EventEmitterError.codes.INVALID_EVENT);

		// Should have entity and event properties with type string
		if(typeof event.entity !== 'string' || typeof event.event !== 'string')
			throw new EventEmitterError('Invalid event: should have a valid entity and event properties', EventEmitterError.codes.INVALID_EVENT_PROPERTIES);

		// If client property exists it must be a string
		if(typeof event.client !== 'undefined' && typeof event.client !== 'string')
			throw new EventEmitterError('Invalid event: client property must be a string', EventEmitterError.codes.INVALID_EVENT_PROPERTIES);

		// If id property exists it must be a string or number
		if(typeof event.id !== 'undefined' && typeof event.client !== 'string' && typeof event.client !== 'number')
			throw new EventEmitterError('Invalid event: id property must be a string or number', EventEmitterError.codes.INVALID_EVENT_PROPERTIES);
	}

	/**
	 * Emits an event to janis-events
	 * @param {Object} event event object
	 * @returns {Object} a MS Call response object with the following keys: headers, statusCode, statusMessage, body
	 * @throws if the operation fails
	 */
	static async emit(event) {

		if(typeof this._serviceName === 'undefined')
			throw new EventEmitterError('Can\'t emit the event: Unknown service name', EventEmitterError.codes.NO_SERVICE_NAME);

		this._validateEvent(event);

		const ms = new MicroserviceCall();

		try {

			const response = await ms.post(this._eventsService, this._eventsNamespace, this._eventsMethod, { ...event, service: this._serviceName });

			return {
				result: response.statusCode === 200,
				response
			};

		} catch(err) {
			throw new EventEmitterError(err, EventEmitterError.codes.MS_CALL_ERROR);
		}
	}

}

module.exports = EventEmitter;
