const _ = require('lodash');

module.exports = function loggingMiddlewareFactory(logger) {
	return function loggingMiddleware(req, res, next) {
		if (!_.isEmpty(req.headers)) {
			logger.debug('Request Headers: %s', req.headers);
		}

		if (!_.isEmpty(req.query)) {
			logger.debug('Request Query: %s', req.query);
		}

		if (!_.isEmpty(req.body)) {
			logger.debug('Request Body: %s', req.body);
		}

		next();
	};
};
