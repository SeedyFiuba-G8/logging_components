const _ = require('lodash');
const winston = require('winston');

module.exports = function $logger(config) {
	const timezone = () => {
		return new Date().toLocaleString('es-AR', {
			timeZone: 'America/Argentina/Buenos_Aires',
		});
	};

	const prettifyFormat = winston.format.printf((info) => {
		const { level, ...content } = info;
		return `${level}: ${JSON.stringify(content, null, 2)}`;
	});

	const localFormat = winston.format.combine(
		winston.format.colorize(),
		prettifyFormat
	);

	const jsonFormat = winston.format.combine(
		winston.format.timestamp({ format: timezone }),
		winston.format.json()
	);

	const logFormat = config.format === 'local' ? localFormat : jsonFormat;

	const logger = winston.createLogger({
		format: logFormat,
	});

	logger.silent = Object.keys(config).every((key) => !config[key].enabled);

	const transports = [
		{
			type: 'console',
			adder: addConsoleTransport,
		},
		{
			type: 'http',
			adder: addHttpTransport,
		},
	];

	transports.forEach((transport) => {
		if ((config[transport.type] || {}).enabled)
			transport.adder(config, logger);
	});

	function callLogger(loggerFunc, object) {
		const firstKeys = ['logType', 'statusCode', 'method'];
		const firstPart = objectToLogLine(_.pick(object, firstKeys));
		const otherPart = objectToLogLine(_.omit(object, firstKeys));

		loggerFunc.call(logger, { ...firstPart, ...otherPart });
	}

	function objectToLogLine(object) {
		let message = {};
		_.forIn(object, (value, key) => {
			message = { ...message, [key]: formatValueToLog(value) };
		});

		return message;
	}

	return {
		error: function error(args) {
			callLogger(logger.error, makeTags(args));
		},
		debug: function debug(args) {
			callLogger(logger.debug, makeTags(args));
		},
		info: function info(args) {
			callLogger(logger.info, makeTags(args));
		},
		warn: function warn(args) {
			callLogger(logger.warn, makeTags(args));
		},
	};
};

function makeTags(args) {
	if (_.isString(args)) {
		return { message: args };
	}
	if (_.isError(args)) {
		return { error: args };
	}
	return args;
}

function formatValueToLog(value) {
	if (_.isString(value)) {
		return value;
	}
	if (_.isError(value)) {
		return formatValueToLog({
			...value,
			name: value.name,
			message: value.message,
			errors: value.errors,
			stack: value.stack,
		});
	}
	return value;
}

function addConsoleTransport(config, logger) {
	const newTransport = new winston.transports.Console({
		stderrLevels: ['error'],
		...config.console,
	});
	logger.add(newTransport);
}

function addHttpTransport(config, logger) {
	const newTransport = new winston.transports.Http(config.http);
	logger.add(newTransport);
}
