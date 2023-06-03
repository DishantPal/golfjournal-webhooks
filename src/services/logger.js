const winston = require('winston');
const config = require('../config');

const enumerateErrorFormat = winston.format((info) => {
    if (info instanceof Error) {
        Object.assign(info, { message: info.message, stack: info.stack });
    }
    return info;
});

const logger = winston.createLogger({
    level: config.app.env === 'development' ? 'debug' : 'info',
    format: winston.format.combine(
        enumerateErrorFormat(),
        config.app.env === 'development' ? winston.format.colorize() : winston.format.uncolorize(),
        winston.format.splat(),
        winston.format.timestamp({
            format: 'YYYY-MM-DD hh:mm:ss'
        }),
        winston.format.printf(info => `${info.level}: ${[info.timestamp]}: ${typeof info.message == 'object' ? JSON.stringify(info.message) : info.message}`)
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: config.app.log_location, level: 'info' }),
    ],
});

module.exports = logger;