"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = connectDatabase;
exports.disconnectDatabase = disconnectDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = require("./index");
const logger_1 = __importDefault(require("../utils/logger"));
async function connectDatabase() {
    try {
        await mongoose_1.default.connect(index_1.config.mongodbUri);
        logger_1.default.info('MongoDB connected successfully');
    }
    catch (error) {
        logger_1.default.error('MongoDB connection failed', { error });
        process.exit(1);
    }
    mongoose_1.default.connection.on('disconnected', () => {
        logger_1.default.warn('MongoDB disconnected');
    });
}
async function disconnectDatabase() {
    await mongoose_1.default.disconnect();
}
//# sourceMappingURL=database.js.map