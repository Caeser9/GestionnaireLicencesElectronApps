"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const config_1 = require("./config");
const errorHandler_1 = require("./middleware/errorHandler");
const signResponse_1 = require("./middleware/signResponse");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const clientRoutes_1 = __importDefault(require("./routes/clientRoutes"));
const catalogRoutes_1 = __importDefault(require("./routes/catalogRoutes"));
const licenseRoutes_1 = __importDefault(require("./routes/licenseRoutes"));
const clientApiRoutes_1 = __importDefault(require("./routes/clientApiRoutes"));
const statsRoutes_1 = __importDefault(require("./routes/statsRoutes"));
const app = (0, express_1.default)();
app.set('trust proxy', 1);
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: config_1.config.corsOrigin,
    credentials: true,
}));
app.use((0, morgan_1.default)(config_1.config.env === 'production' ? 'combined' : 'dev'));
app.use(express_1.default.json({ limit: '1mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
const globalRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: { success: false, error: 'Trop de requêtes' },
});
app.use(globalRateLimit);
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use(signResponse_1.signResponse);
// Admin API
app.use('/api/auth', authRoutes_1.default);
app.use('/api/clients', clientRoutes_1.default);
app.use('/api/catalog', catalogRoutes_1.default);
app.use('/api/licenses', licenseRoutes_1.default);
app.use('/api/stats', statsRoutes_1.default);
// Client API (Electron apps)
app.use('/api/v1/client', clientApiRoutes_1.default);
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map