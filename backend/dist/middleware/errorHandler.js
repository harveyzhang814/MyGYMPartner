"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const client_1 = require("@prisma/client");
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    console.error(err);
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case 'P2002':
                error.message = 'Duplicate field value entered';
                error.statusCode = 400;
                break;
            case 'P2014':
                error.message = 'Invalid ID';
                error.statusCode = 400;
                break;
            case 'P2003':
                error.message = 'Invalid reference';
                error.statusCode = 400;
                break;
            case 'P2025':
                error.message = 'Record not found';
                error.statusCode = 404;
                break;
            default:
                error.message = 'Database error';
                error.statusCode = 500;
        }
    }
    if (err.name === 'JsonWebTokenError') {
        error.message = 'Invalid token';
        error.statusCode = 401;
    }
    if (err.name === 'TokenExpiredError') {
        error.message = 'Token expired';
        error.statusCode = 401;
    }
    if (err.name === 'ValidationError') {
        error.message = 'Validation error';
        error.statusCode = 400;
    }
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Server Error';
    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map