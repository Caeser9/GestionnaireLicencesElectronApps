"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signResponse = signResponse;
const crypto_1 = require("../utils/crypto");
function signResponse(req, res, next) {
    const originalJson = res.json.bind(res);
    res.json = function (body) {
        if (req.path.startsWith('/api/v1/client') && body.success && body.data) {
            const signature = (0, crypto_1.signApiResponse)(body.data);
            return originalJson({ ...body, signature });
        }
        return originalJson(body);
    };
    next();
}
//# sourceMappingURL=signResponse.js.map