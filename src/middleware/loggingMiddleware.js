const _ = require('lodash');

module.exports = function $loggingMiddleware(logger) {
	return function loggingMiddleware(req, res, next) {
		const { ip, method, originalUrl, hostname } = req;

		let additional = {};
		let value;
		['body', 'headers', 'query'].forEach((field) => {
			value = req[field];
			if (value && !_.isEmpty(value)) additional[field] = req[field];
		});

		const logObject = {
			message: 'Request received',
			ip,
			method,
			url: hostname + originalUrl,
			...additional,
		};

		logger.debug(logObject);
		next();
	};
};
