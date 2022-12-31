"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerError = exports.FileTooLargeError = exports.UnauthorizedError = exports.NotFoundError = exports.BadRequestError = exports.JoiRequestValidationError = exports.CustomError = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
class CustomError extends Error {
    constructor(message) {
        super(message);
    }
    serializeErrors() {
        return {
            message: this.message,
            statusCode: this.statusCode,
            status: this.status
        };
    }
}
exports.CustomError = CustomError;
class JoiRequestValidationError extends CustomError {
    constructor(message) {
        super(message);
        this.statusCode = http_status_codes_1.default.BAD_REQUEST;
        this.status = 'error';
    }
}
exports.JoiRequestValidationError = JoiRequestValidationError;
class BadRequestError extends CustomError {
    constructor(message) {
        super(message);
        this.statusCode = http_status_codes_1.default.BAD_REQUEST;
        this.status = 'error';
    }
}
exports.BadRequestError = BadRequestError;
class NotFoundError extends CustomError {
    constructor(message) {
        super(message);
        this.statusCode = http_status_codes_1.default.NOT_FOUND;
        this.status = 'error';
    }
}
exports.NotFoundError = NotFoundError;
class UnauthorizedError extends CustomError {
    constructor(message) {
        super(message);
        this.statusCode = http_status_codes_1.default.UNAUTHORIZED;
        this.status = 'error';
    }
}
exports.UnauthorizedError = UnauthorizedError;
class FileTooLargeError extends CustomError {
    constructor(message) {
        super(message);
        this.statusCode = http_status_codes_1.default.REQUEST_TOO_LONG;
        this.status = 'error';
    }
}
exports.FileTooLargeError = FileTooLargeError;
class ServerError extends CustomError {
    constructor(message) {
        super(message);
        this.statusCode = http_status_codes_1.default.INTERNAL_SERVER_ERROR;
        this.status = 'error';
    }
}
exports.ServerError = ServerError;
//# sourceMappingURL=error-handler.js.map