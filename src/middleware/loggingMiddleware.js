module.exports = function loggingMiddlewareFactory(logger) {
	return function loggingMiddleware(req, res, next) {
		if (req.headers) {
			logger.debug('Request Headers: %s', req.headers);
		}

		if (req.query) {
			logger.debug('Request Query: %s', req.query);
		}

		if (req.body) {
			logger.debug('Request Body: %s', req.body);
		}

		next();
	};
};
