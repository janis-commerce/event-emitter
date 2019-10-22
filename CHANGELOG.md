# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [2.0.1] - 2019-10-22
### Added
- valid `event.id` and `event.client` test cases

### Fixed
- `event.id` validations

## [2.0.0] - 2019-10-21
### Changed
- Now the `emit()` method returns an object (**BREAKING CHANGE**)

### Added
- `EventEmitterError` now handlers previous errors

## [1.0.1] - 2019-10-09
### Changed
- `main` js file from `index.js` to `lib/index.js`

### Removed
- unnecessary `index.js` file
- unnecessary `lib/index.js` file

## [1.0.0] - 2019-10-04
### Added
- `event-emitter` package
- unit tests
- docs
- `emit()` method validates microservice-call response code