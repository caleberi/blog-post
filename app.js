const config =  require("./config/config");
const express = require('express');
const logger = require("./utils/logger");
const Limiter = require("ratelimiter");
const { createClient } =  require("redis");
const { InternalServerError, BadRequestError } = require("./errors/http");
// const db =  require("./db/client");
const app = express();
const cache = await createClient()
  .on('error', err => console.log('Redis Client Error', err))
  .connect();

const {port,hostName} =  config.application; // destructing 

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


app.post("/user",function (request,response,next){
  const payload = request.body;
  
  registerUserSchema.validate(payload)
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

