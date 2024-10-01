const path =  require("path");
const Joi = require('joi');
const logger = require("../utils/logger");

const currentEnvironment = process.env.NODE_ENV;
require('dotenv')
    .config({
        path: path.resolve(path.join(__dirname,`./.env.${currentEnvironment}`)),
        debug:true,
        encoding:'utf-8'
    })


const config = {
    database: {
        username: process.env.DB_USERNAME || "",
        password:  process.env.DB_PASSWORD || "",
        port:  process.env.DB_PORT || 4948,
    },
}

const configSchema = Joi.object({
    database: Joi.object({
        port:Joi.number().required(),
        username: Joi.string().alphanum().min(8).max(20).required(),
        password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
        hostname: Joi.string(),
    }),
    application: Joi.object({

    })
});

const {error} = configSchema.validate(config,{abortEarly:false});

if (error){
    const {details} = error;
    for(const err of details){
        logger.warn(err.message);
    }
    process.exit(1);
}

module.exports = config;


