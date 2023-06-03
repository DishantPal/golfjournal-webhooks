const winston = require('winston');
const config = require('../config');

const enumerateErrorFormat = winston.format((info) => {
    if (info instanceof Error) {
        Object.assign(info, { message: info.message, stack: info.stack });
    }
    return info;
});

// TODO Fix error stack not avil
const logger = winston.createLogger({
    level: config.app.env === 'development' ? 'debug' : 'info',
    format: winston.format.combine(
        enumerateErrorFormat(),
        winston.format.splat(),
        winston.format.timestamp({
            format: 'YYYY-MM-DD hh:mm:ss'
        }),
        winston.format.printf(info => `${info.level}: ${[info.timestamp]}: ${typeof info.message == 'object' ? JSON.stringify(info.message) : info.message}`)
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: "app.log", level: 'info' }),
    ],
});

module.exports = logger;