"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditResource = exports.AuditAction = exports.ActivationRequestStatus = exports.LicenseStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["ADMIN"] = "admin";
    UserRole["SUPPORT"] = "support";
    UserRole["MODERATOR"] = "moderator";
})(UserRole || (exports.UserRole = UserRole = {}));
var LicenseStatus;
(function (LicenseStatus) {
    LicenseStatus["PENDING"] = "pending";
    LicenseStatus["ACTIVE"] = "active";
    LicenseStatus["SUSPENDED"] = "suspended";
    LicenseStatus["EXPIRED"] = "expired";
})(LicenseStatus || (exports.LicenseStatus = LicenseStatus = {}));
var ActivationRequestStatus;
(function (ActivationRequestStatus) {
    ActivationRequestStatus["PENDING"] = "pending";
    ActivationRequestStatus["APPROVED"] = "approved";
    ActivationRequestStatus["REJECTED"] = "rejected";
})(ActivationRequestStatus || (exports.ActivationRequestStatus = ActivationRequestStatus = {}));
var AuditAction;
(function (AuditAction) {
    AuditAction["CREATE"] = "create";
    AuditAction["UPDATE"] = "update";
    AuditAction["DELETE"] = "delete";
    AuditAction["LOGIN"] = "login";
    AuditAction["LOGOUT"] = "logout";
    AuditAction["ACTIVATE"] = "activate";
    AuditAction["SUSPEND"] = "suspend";
    AuditAction["REACTIVATE"] = "reactivate";
    AuditAction["TRANSFER"] = "transfer";
    AuditAction["REJECT"] = "reject";
    AuditAction["APPROVE"] = "approve";
})(AuditAction || (exports.AuditAction = AuditAction = {}));
var AuditResource;
(function (AuditResource) {
    AuditResource["USER"] = "user";
    AuditResource["CLIENT"] = "client";
    AuditResource["PRODUCT"] = "product";
    AuditResource["MODULE"] = "module";
    AuditResource["LICENSE"] = "license";
    AuditResource["LICENSE_TYPE"] = "license_type";
    AuditResource["ACTIVATION"] = "activation";
    AuditResource["APP_VERSION"] = "app_version";
    AuditResource["AUTH"] = "auth";
})(AuditResource || (exports.AuditResource = AuditResource = {}));
//# sourceMappingURL=index.js.map