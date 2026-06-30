"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
const AppError_1 = require("../utils/AppError");
const logger_1 = __importDefault(require("../utils/logger"));
function errorHandler(err, _req, res, _next) {
    if (err instanceof AppError_1.AppError) {
        res.status(err.statusCode).json({
            success: false,
            error: err.message,
        });
        return;
    }
    logger_1.default.error('Unhandled error', { error: err.message, stack: err.stack });
    res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur',
    });
}
function notFoundHandler(_req, res) {
    res.status(404).json({
        success: false,
        error: 'Route non trouvée',
    });
}
//# sourceMappingURL=errorHandler.js.map