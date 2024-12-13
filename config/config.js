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


    const configSchema = Joi.object({
        database: Joi.object({
            port: Joi.number().required(),
            username: Joi.string().alphanum().min(8).max(20).required(),
            password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
            hostName: Joi.string(),
        }),
        application: Joi.object({
            port: Joi.number().required(),
            hostName: Joi.string().required()
        }),
        mail: Joi.object({
            from: Joi.string().required(),
            port: Joi.number().required(),
            hostName: Joi.string().required()
        })
    });

    
const config = {
    database: {
        username: process.env.DB_USERNAME  ||  "sheriff923",
        password:  process.env.DB_PASSWORD || "CyberNinja2024",
        port:  process.env.DB_PORT || 4948,
        hostName:  process.env.DB_HOST || "victor.org",
    },
    application: {
        port: process.env.APP_PORT || 9090,
        hostName: process.env.APP_HOST || "0.0.0.0",
    },
    mail: {
        from: process.env.MAIL_FROM  || "",
        port: process.env.MAIL_PORT || 9090,
        hostName: process.env.MAIL_HOST || "0.0.0.0",
    }
}


const {error} = configSchema.validate(config,{abortEarly:false});

if (error){
    const {details} = error;
    for(const err of details){
        logger.warn(err.message);
    }
    process.exit(1);
}

module.exports = config;