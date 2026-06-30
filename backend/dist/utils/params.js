"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParam = getParam;
exports.getParamId = getParamId;
const AppError_1 = require("./AppError");
function getParam(params, key = 'id') {
    const value = params[key];
    if (typeof value === 'string')
        return value;
    if (Array.isArray(value) && value[0])
        return value[0];
    throw new AppError_1.AppError(`Paramètre ${key} manquant`, 400);
}
function getParamId(params) {
    return getParam(params, 'id');
}
//# sourceMappingURL=params.js.map