"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = getDashboardStats;
exports.getAuditLogs = getAuditLogs;
const statsService_1 = require("../services/statsService");
const AppError_1 = require("../utils/AppError");
async function getDashboardStats(req, res, next) {
    try {
        let stats;
        if (req.user?.role === 'moderator') {
            if (!req.user.productId)
                throw new AppError_1.AppError('Ce compte modérateur doit être associé à une application', 403);
            stats = await statsService_1.statsService.getProductDashboardStats(req.user.productId);
        }
        else {
            stats = await statsService_1.statsService.getDashboardStats();
        }
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