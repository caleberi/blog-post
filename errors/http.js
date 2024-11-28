const httpCodes = require("http-status");

// Base Custom Error class
export class CustomError extends Error {
    constructor(code, message) {
        super(message);
        this.name = this.constructor.name;
        this.message = message;
        this.code = code;
        Error.captureStackTrace(this, this.constructor);
    }
}

// 400 Bad Request
export class BadRequestError extends CustomError {
    constructor(message = 'Bad Request') {
        super(httpCodes.BAD_REQUEST, message);
    }
}

// 401 Unauthorized
export class UnauthorizedError extends CustomError {
    constructor(message = 'Unauthorized') {
        super(httpCodes.UNAUTHORIZED, message);
    }
}

// 403 Forbidden
export class ForbiddenError extends CustomError {
    constructor(message = 'Forbidden') {
        super(httpCodes.FORBIDDEN, message);
    }
}

// 404 Not Found
export class NotFoundError extends CustomError {
    constructor(message = 'Not Found') {
        super(httpCodes.NOT_FOUND, message);
    }
}

// 409 Conflict
export class ConflictError extends CustomError {
    constructor(message = 'Conflict') {
        super(httpCodes.CONFLICT, message);
    }
}

// 422 Unprocessable Entity
export class UnprocessableEntityError extends CustomError {
    constructor(message = 'Unprocessable Entity') {
        super(httpCodes.UNPROCESSABLE_ENTITY, message);
    }
}

// 500 Internal Server Error
export class InternalServerError extends CustomError {
    constructor(message = 'Internal Server Error') {
        super(httpCodes.INTERNAL_SERVER_ERROR, message);
    }
}

// 502 Bad Gateway
export class BadGatewayError extends CustomError {
    constructor(message = 'Bad Gateway') {
        super(httpCodes.BAD_GATEWAY, message);
    }
}

// 503 Service Unavailable
export class ServiceUnavailableError extends CustomError {
    constructor(message = 'Service Unavailable') {
        super(httpCodes.SERVICE_UNAVAILABLE, message);
    }
}

// 504 Gateway Timeout
export class GatewayTimeoutError extends CustomError {
    constructor(message = 'Gateway Timeout') {
        super(httpCodes.GATEWAY_TIMEOUT, message);
    }
}