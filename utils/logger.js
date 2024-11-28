const winston = require('winston')

// checkout the library :https://www.npmjs.com/package/winston
const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        winston.format.errors({ stack: true }),
        winston.format.prettyPrint(),
    ),
    transports: [
        new winston.transports.Console({
            level: 'info',
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple(),
                winston.format.errors({ stack: true }),
            )
        }),
        new winston.transports.File({
            level: 'error',
            name: 'tmp',
            filename: 'tmp.log',
            dirname: process.cwd(),
            maxsize: 4096,
            zippedArchive: true
        })
    ]
});



module.exports = logger