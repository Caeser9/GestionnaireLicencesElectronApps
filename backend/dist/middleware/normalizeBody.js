"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeLicenseNumericFields = normalizeLicenseNumericFields;
function toOptionalInt(value) {
    if (value === '' || value === null || value === undefined)
        return undefined;
    const n = Number(value);
    if (Number.isNaN(n) || n < 1)
        return undefined;
    return Math.floor(n);
}
/** Convertit maxUsers / maxWorkstations envoyés en string par le formulaire */
function normalizeLicenseNumericFields(req, _res, next) {
    if (req.body && typeof req.body === 'object') {
        const maxUsers = toOptionalInt(req.body.maxUsers);
        const maxWorkstations = toOptionalInt(req.body.maxWorkstations);
        if (maxUsers !== undefined)
            req.body.maxUsers = maxUsers;
        else
            delete req.body.maxUsers;
        if (maxWorkstations !== undefined)
            req.body.maxWorkstations = maxWorkstations;
        else
            delete req.body.maxWorkstations;
    }
    next();
}
//# sourceMappingURL=normalizeBody.js.map