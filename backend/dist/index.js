"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const database_1 = require("./config/database");
const config_1 = require("./config");
const logger_1 = __importDefault(require("./utils/logger"));
async function bootstrap() {
    await (0, database_1.connectDatabase)();
    app_1.default.listen(config_1.config.port, () => {
        logger_1.default.info(`Server running on port ${config_1.config.port}`, {
            env: config_1.config.env,
            url: config_1.config.apiBaseUrl,
        });
    });
}
bootstrap().catch((error) => {
    logger_1.default.error('Failed to start server', { error });
    process.exit(1);
});
//# sourceMappingURL=index.js.map