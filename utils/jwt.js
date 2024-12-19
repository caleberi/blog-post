import { CustomError } from "../errors/http";

const jwt = require("jsonwebtoken");
const config =  require("../config/config");
const promisify = require("util").promisify;
const sign = promisify(jwt.sign);

export async function generateJwtToken (user) {
    const payload = {id: user.id}; // {1: "Caleb"}
    const algorithm = config.jwt.algorithm;
    const secret =  config.jwt.secret;
    const expiresIn =  config.jwt.expiresIn;

    const audience = user.last_name + ' ' + user.first_name;
    const issuer = config.jwt.issuer;

    const token = await sign(payload,secret,{
        issuer, audience,algorithm,expiresIn
    }).catch(err=>{
        throw {jwtSigningError: err};
    })

    return token; // "erepowisjg98p3rtwobgobgnwt9024u2094.90wj9jwb009wt90"
}

export async function verifyJwtToken(token) { // "erepowisjg98p3rtwobgobgnwt9024u2094.90wj9jwb009wt90"
     const data =  jwt.verify(
        token,
        config.jwt.secret,{
        algorithms:config.jwt.algorithm,
        issuer: config.jwt.issuer,
     })
     const {payload,exp} = data;
    if ( Date.now() > exp) {
        throw new CustomError(101,"Token has expired!.");
    }

    return payload;
}


