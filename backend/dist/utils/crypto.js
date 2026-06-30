"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateLicenseKey = generateLicenseKey;
exports.generateLicenseToken = generateLicenseToken;
exports.signLicensePayload = signLicensePayload;
exports.verifyLicenseSignature = verifyLicenseSignature;
exports.signApiResponse = signApiResponse;
exports.getPublicKey = getPublicKey;
exports.hashMachineId = hashMachineId;
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
const config_1 = require("../config");
const logger_1 = __importDefault(require("./logger"));
let privateKey = null;
let publicKey = null;
function loadKeys() {
    try {
        if (fs_1.default.existsSync(config_1.config.license.privateKeyPath)) {
            privateKey = fs_1.default.readFileSync(config_1.config.license.privateKeyPath, 'utf8');
        }
        if (fs_1.default.existsSync(config_1.config.license.publicKeyPath)) {
            publicKey = fs_1.default.readFileSync(config_1.config.license.publicKeyPath, 'utf8');
        }
    }
    catch (error) {
        logger_1.default.warn('License signing keys not loaded', { error });
    }
}
loadKeys();
function generateLicenseKey() {
    const segments = Array.from({ length: 4 }, () => crypto_1.default.randomBytes(4).toString('hex').toUpperCase());
    return segments.join('-');
}
function generateLicenseToken() {
    return crypto_1.default.randomBytes(32).toString('hex');
}
function signLicensePayload(payload) {
    if (!privateKey) {
        throw new Error('License private key not configured. Run: npm run generate-keys');
    }
    const data = JSON.stringify(payload);
    const sign = crypto_1.default.createSign('SHA256');
    sign.update(data);
    sign.end();
    return sign.sign(privateKey, 'base64');
}
function verifyLicenseSignature(payload, signature) {
    if (!publicKey) {
        throw new Error('License public key not configured');
    }
    const data = JSON.stringify(payload);
    const verify = crypto_1.default.createVerify('SHA256');
    verify.update(data);
    verify.end();
    return verify.verify(publicKey, signature, 'base64');
}
function signApiResponse(data) {
    if (!privateKey) {
        return '';
    }
    const sign = crypto_1.default.createSign('SHA256');
    sign.update(JSON.stringify(data));
    sign.end();
    return sign.sign(privateKey, 'base64');
}
function getPublicKey() {
    return publicKey;
}
function hashMachineId(machineId) {
    return crypto_1.default.createHash('sha256').update(machineId).digest('hex');
}
//# sourceMappingURL=crypto.js.map