"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = getDashboardStats;
exports.getAuditLogs = getAuditLogs;
const statsService_1 = require("../services/statsService");
async function getDashboardStats(_req, res, next) {
    try {
        const stats = await statsService_1.statsService.getDashboardStats();
        res.json({ success: true, data: stats });
    }
    catch (error) {
        next(error);
    }
}
async function getAuditLogs(req, res, next) {
    try {
        const result = await statsService_1.statsService.getAuditLogs(Number(req.query.page) || 1, Number(req.query.limit) || 30);
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=statsController.js.map