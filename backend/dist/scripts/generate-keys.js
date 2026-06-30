"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const keysDir = path_1.default.join(__dirname, '../../keys');
if (!fs_1.default.existsSync(keysDir)) {
    fs_1.default.mkdirSync(keysDir, { recursive: true });
}
const { privateKey, publicKey } = crypto_1.default.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});
fs_1.default.writeFileSync(path_1.default.join(keysDir, 'license-private.pem'), privateKey);
fs_1.default.writeFileSync(path_1.default.join(keysDir, 'license-public.pem'), publicKey);
console.log('RSA key pair generated successfully in backend/keys/');
console.log('Keep license-private.pem SECRET and never commit it to version control.');
//# sourceMappingURL=generate-keys.js.map