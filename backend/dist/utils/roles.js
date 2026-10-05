"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_LABELS = exports.ROLE_HIERARCHY = void 0;
exports.hasMinimumRole = hasMinimumRole;
const types_1 = require("../types");
exports.ROLE_HIERARCHY = {
    [types_1.UserRole.SUPER_ADMIN]: 3,
    [types_1.UserRole.ADMIN]: 2,
    [types_1.UserRole.SUPPORT]: 1,
    [types_1.UserRole.MODERATOR]: 1,
};
function hasMinimumRole(userRole, requiredRole) {
    return exports.ROLE_HIERARCHY[userRole] >= exports.ROLE_HIERARCHY[requiredRole];
}
exports.ROLE_LABELS = {
    [types_1.UserRole.SUPER_ADMIN]: 'Super Admin',
    [types_1.UserRole.ADMIN]: 'Administrateur',
    [types_1.UserRole.SUPPORT]: 'Support Technique',
    [types_1.UserRole.MODERATOR]: 'Modérateur client',
};
//# sourceMappingURL=roles.js.map