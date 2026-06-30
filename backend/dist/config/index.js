"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
exports.config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '4000', 10),
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:4000',
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/license-platform',
    jwt: {
        secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '8h',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },
    license: {
        privateKeyPath: path_1.default.resolve(process.env.LICENSE_PRIVATE_KEY_PATH || './keys/license-private.pem'),
        publicKeyPath: path_1.default.resolve(process.env.LICENSE_PUBLIC_KEY_PATH || './keys/license-public.pem'),
        checkIntervalDays: parseInt(process.env.LICENSE_CHECK_INTERVAL_DAYS || '30', 10),
    },
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
        max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    },
    seed: {
        adminEmail: process.env.SEED_ADMIN_EMAIL || 'admin@example.com',
        adminPassword: process.env.SEED_ADMIN_PASSWORD || 'Admin123!ChangeMe',
    },
};
exports.default = exports.config;
//# sourceMappingURL=index.js.map