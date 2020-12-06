// http://tostring.it/2014/06/23/advanced-logging-with-nodejs/
// https://github.com/winstonjs/winston/issues/1200
// https://stackoverflow.com/questions/51074805/typeerror-winston-logger-is-not-a-constructor-with-winston-and-morgan
var winston = require('winston');

var logger = winston.createLogger({
    transports: [
        new winston.transports.File({
            level: 'error',
            filename: './logs/error-logs.log',
            handleExceptions: true,
            json: true,
            maxsize: 52428800, //50MB
            maxFiles: 20,
            colorize: false
        }),
        new winston.transports.File({
            level: 'info',
            filename: './logs/info-logs.log',
            handleExceptions: true,
            json: true,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: false
        }),
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            json: false,
            colorize: true
        })
    ],
    exitOnError: false
});

module.exports = logger;
module.exports.stream = {
    write: function (message, encoding) {
        logger.info(message);
    }
};