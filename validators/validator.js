const Joi = require("joi");

const RegisterUserSchema =  Joi.object({
    email: Joi.string().email().required(),
    first_name: Joi.string(),
    last_name: Joi.string(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
});



const LoginUserSchema =  Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
});


module.exports = {
    RegisterUserSchema,
    LoginUserSchema
}