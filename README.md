# event-emitter

[![Build Status](https://travis-ci.org/janis-commerce/event-emitter.svg?branch=master)](https://travis-ci.org/janis-commerce/event-emitter)
[![Coverage Status](https://coveralls.io/repos/github/janis-commerce/event-emitter/badge.svg?branch=master)](https://coveralls.io/github/janis-commerce/event-emitter?branch=master)

A package for emit events to janis-events

## Installation
```sh
npm install @janiscommerce/event-emitter
```

## Configuration
### ENV variables
`JANIS_SERVICE_NAME` (required): The name of the service that will emit the event.

### Important
This package uses [@janiscommerce/microservice-call](https://www.npmjs.com/package/@janiscommerce/microservice-call), it's strongly recommended read this package docs before continue.

## API

### **`emit(event)`**

Emits an event to janis-events

#### Event parameter

The event parameter is an `[Object]` and have the next struct:
- **`entity [String]`** (required): The name of the entity that is emiting the event
- **`event [String]`** (required): The event name
- **`client [String]`** (optional): The client code name
- **`id [Number|String]`** (optional): The ID of the entity that is emiting the event

## Errors

The errors are informed with a `EventEmitterError`.  
This object has a code that can be useful for a correct error handling.  
The codes are the following:  

| Code | Description                    |
|------|--------------------------------|
| 1    | Invalid event                  |
| 2    | Invalid event properties       |
| 3    | Unknown/empty service name     |
| 4    | MicroserviceCall Error         |

## Usage
```js
const EventEmitter = require('@janiscommerce/event-emitter');

(async () => {

	try {
		await EventEmitter.emit({
			entity: 'some-entity',
			event: 'some-event',
			client: 'some-client',
			id: 1
		})
	} catch(err) {
		throw err;
	}

})();
```
