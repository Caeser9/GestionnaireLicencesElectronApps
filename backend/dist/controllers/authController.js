"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.getMe = getMe;
exports.listUsers = listUsers;
exports.createUser = createUser;
exports.updateUser = updateUser;
const authService_1 = require("../services/authService");
const params_1 = require("../utils/params");
async function login(req, res, next) {
    try {
        const result = await authService_1.authService.login(req.body.email, req.body.password, req);
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
}
async function getMe(req, res, next) {
    try {
        const user = await authService_1.authService.getMe(req.user.userId);
        res.json({ success: true, data: user });
    }
    catch (error) {
        next(error);
    }
}
async function listUsers(_req, res, next) {
    try {
        const users = await authService_1.authService.listUsers();
        res.json({ success: true, data: users });
    }
    catch (error) {
        next(error);
    }
}
async function createUser(req, res, next) {
    try {
        const user = await authService_1.authService.createUser(req.body, req.user, req);
        res.status(201).json({ success: true, data: user });
    }
    catch (error) {
        next(error);
    }
}
async function updateUser(req, res, next) {
    try {
        const user = await authService_1.authService.updateUser((0, params_1.getParamId)(req.params), req.body, req.user, req);
        res.json({ success: true, data: user });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=authController.js.map