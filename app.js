const config =  require("./config/config");
const express = require('express');
const logger = require("./utils/logger");
const Limiter = require("ratelimiter");
const { createClient } =  require("redis");
const { InternalServerError, BadRequestError, UnauthorizedError } = require("./errors/http");
const { RegisterUserSchema, LoginUserSchema } = require("./validators/validator");
const {default: httpCodes} =  require("http-status");

const { hashPassword, comparePassword } = require("./utils/bcrypt");
const  {default: Mailer}  = require("./utils/mailer");
const  {generateJwtToken, verifyJwtToken}  = require("./utils/jwt");

const app = express();
const cache = await createClient()
  .on('error', err => console.log('Redis Client Error', err))
  .connect();
const db =  require("./db/client")(config);
const {port,hostName} =  config.application; // destructing 
const mailer = new Mailer(config.mail); //
// JSON PARSING MIDDLEWARE
app.use(express.json({extended:true}))
// REQUEST LOGGING MIDDLEWARE
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))

// RATE LIMITING MIDDLEWARE
app.use(function(request,response,next){
  const id = request.user._id;
  const ratelimiter = new Limiter({ id: id, db: cache });
  ratelimiter.get(function(err, limit){
    if (err) return next(err); 
    
    response.set('X-RateLimit-Limit', limit.total);
    response.set('X-RateLimit-Remaining', limit.remaining - 1);
    response.set('X-RateLimit-Reset', limit.reset);
    logger.info('remaining %s/%s %s', limit.remaining - 1, limit.total, id);
    if (limit.remaining) return next();

    var delta = (limit.reset * 1000) - Date.now() | 0;
    var after = limit.reset - (Date.now() / 1000) | 0;
    response.set('Retry-After', after);
    response.send(429, 'Rate limit exceeded, retry in ' + ms(delta, { long: true }));
  });
})

/* HANDLER FOR: 
  - AUTHENTICATION
  - REGISTRATION
  - BLOGS
  - USER
*/


app.post("/register",async function (request,response){
  const payload = request.body;
  const  {error} = RegisterUserSchema.validate(payload)
  if (error){
    return response.status(httpCodes.BAD_REQUEST).json({
      "success": false,
      "error": error.details.map(err=>(err.message)),
      "data":{}
    })
  }

  const { email, first_name, last_name } = payload;
  const hashed = hashPassword(payload.password)
  
  const result = await db.user.create({
    data: { email, first_name, last_name, password: hashed },
    select: { email:true,first_name:true,last_name: true}
  })

  logger.info(`successfully created a user with email: ${result.email}`);

  await mailer.sendMail(config.mail.from,email,{
    subject: "Registration", 
    text: "You have successfully registered."
  });

  return response.json(httpCodes.CREATED).json({
      "success": true,
      "error": {},
      "data": result,
  })
})

app.post("/login", async function(request, response){
  const payload = request.body;
  const  {error} = LoginUserSchema.validate(payload)
  if (error){
    return response.status(httpCodes.BAD_REQUEST).json({
      "success": false,
      "error": error.details.map(err=>(err.message)),
      "data":{}
    })
  }

  const { email, password } = payload;
  const user = await db.user.findUnique({
    where: { email },
    select: { 
      password: true, 
      id:true, 
      first_name: true , 
      last_name:true
    },
  });

  if (!comparePassword(password,user.password)) {
    return response.status(httpCodes.BAD_REQUEST).json({
      "success": false,
      "error": "You are a cheat lol, password incorrect",
      "data":{}
    })
  }

  const token =  await generateJwtToken(user);
  return response.json(httpCodes.CREATED).json({
    "success": true,
    "error": {},
    "data": {
      "authToken": token,
    },
  })
})

app.use(async function (req,res,next){
  if (!req.header['authorization']) {
    return next(new UnauthorizedError("Unauthorized request"))
  }

  const fragments = req.header['authorization'].split(" ")
  const [_, token] = fragments;

  try {
    const payload = await  verifyJwtToken(token);
    const user = await db.user.findUnique({ where:{id : payload.id},select:{id:true,email:true,first_name:true,last_name:true}})
    req.user = user;
    next();
  } catch(err){
    return next(err);
  }
})


app.get("/user/profile",function (req,res){
  return response.status(200).json({
    success: true,
    message: "Here is your profile",
    data: req.user
 })
})


app.delete("/user/profile",async function(req,res){
  await db.user.delete({where: {id:  req.user.id}});
  return response.status(200).json({
    success: true,
    message: "profile deleted",
    data: {}
 })
})




// GLOBAL ERROR HANDLER
app.use(function globalErrorHandler(err, request, response, next) {
  const {path,method, headers} = request;
  logger.info({ path, method,headers })
  if (res.headersSent) {
    return next(err)
  }
  logger.error(err.message)
  if (err instanceof BadRequestError) {
    return  response.status(err.code).json({
      success: false,
      message: "You are stupid for trying to hack us",
      data: {}
    })
  }

  if (err instanceof InternalServerError) {
    return response.status(err.code).json({
      success: false,
      message: "Our engineering have been notified and will work on it in 3 days time 🤓",
      data: {}
    })
  }

 return response.status(500).json({
    success: false,
    message: "Something went wrong.",
    data: {}
 })
})



// CREATING A SERVER  FOR THE BACKEND
const server =  app.listen(port,hostName, function listener(){
  logger.info("Running <:> ")
  logger.info(`App running on http://${hostName}:${port}`)
})

// FOR HANDLING PROGRAM TERMINATION
process.on('SIGINT', function(cache,server){
  return async function(){
    await cache.disconnect();
    server.close((err)=>{
      logger.info("Server successfully terminated.")
    })
    process.exit(0);
  }
}(cache,server));

