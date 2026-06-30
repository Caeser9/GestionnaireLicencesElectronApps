"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.verify = verify;
exports.activationStatus = activationStatus;
exports.getLicenseInfo = getLicenseInfo;
exports.transfer = transfer;
exports.getModules = getModules;
exports.checkUpdates = checkUpdates;
exports.heartbeat = heartbeat;
exports.getPublicKeyEndpoint = getPublicKeyEndpoint;
const params_1 = require("../utils/params");
const clientApiService_1 = require("../services/clientApiService");
const crypto_1 = require("../utils/crypto");
async function activate(req, res, next) {
    try {
        const result = await clientApiService_1.clientApiService.requestActivation(req.body, req);
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
}
async function verify(req, res, next) {
    try {
        const result = await clientApiService_1.clientApiService.verifyLicense(req.body, req);
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
}
async function activationStatus(req, res, next) {
    try {
        const result = await clientApiService_1.clientApiService.getActivationStatus(req.body, req);
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
}
async function getLicenseInfo(req, res, next) {
    try {
        const result = await clientApiService_1.clientApiService.getLicenseInfo((0, params_1.getParam)(req.params, 'token'));
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
}
async function transfer(req, res, next) {
    try {
        const result = await clientApiService_1.clientApiService.transferLicense(req.body, req);
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
}
async function getModules(req, res, next) {
    try {
        const result = await clientApiService_1.clientApiService.getAuthorizedModules((0, params_1.getParam)(req.params, 'token'));
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
}
async function checkUpdates(req, res, next) {
    try {
        const { productSlug, currentVersion } = req.query;
        const licenseToken = req.headers['x-license-token'];
        const result = await clientApiService_1.clientApiService.checkUpdates(productSlug, currentVersion, licenseToken);
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
}
async function heartbeat(req, res, next) {
    try {
        const result = await clientApiService_1.clientApiService.heartbeat(req.body, req);
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
}
async function getPublicKeyEndpoint(_req, res) {
    const publicKey = (0, crypto_1.getPublicKey)();
    res.json({ success: true, data: { publicKey } });
}
//# sourceMappingURL=clientApiController.js.map