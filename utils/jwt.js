const jwt = require("jsonwebtoken");
const promisify = require("util").promisify;
const sign = promisify(jwt.sign);
const verify = promisify(jwt.verify);

const generateJwtToken = async function (user,config) {
        const payload = {id: user.id};
        const algorithm = config.jwtAlgorithm || 'HS256';
        const secret =  config.jwtSecret;
        const expiresIn =  config.jwtExpiresIn;
    
        const audience = user.last_name + ' ' + user.first_name;
        const issuer = 'blog-post';

        const token  = await sign(payload,secret,{
            issuer, audience,algorithm,expiresIn
        }).catch(err=>{
            throw {jwtSigningError: err};
        })

        return token;
    }

export default  generateJwtToken 