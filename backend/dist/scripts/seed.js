"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const models_1 = require("../models");
const types_1 = require("../types");
const config_1 = require("../config");
const logger_1 = __importDefault(require("../utils/logger"));
async function seed() {
    await (0, database_1.connectDatabase)();
    logger_1.default.info('Starting database seed...');
    // Super Admin
    const existingAdmin = await models_1.User.findOne({ email: config_1.config.seed.adminEmail });
    let admin = existingAdmin;
    if (!admin) {
        admin = await models_1.User.create({
            email: config_1.config.seed.adminEmail,
            password: config_1.config.seed.adminPassword,
            firstName: 'Super',
            lastName: 'Admin',
            role: types_1.UserRole.SUPER_ADMIN,
        });
        logger_1.default.info(`Super Admin created: ${admin.email}`);
    }
    // License Types
    const licenseTypes = [
        { slug: 'basic', name: 'Basic', defaultMaxUsers: 2, defaultMaxWorkstations: 1, defaultModules: ['products', 'stock'], sortOrder: 1 },
        { slug: 'standard', name: 'Standard', defaultMaxUsers: 5, defaultMaxWorkstations: 2, defaultModules: ['products', 'stock', 'pos'], sortOrder: 2 },
        { slug: 'pro', name: 'Pro', defaultMaxUsers: 15, defaultMaxWorkstations: 5, defaultModules: ['products', 'stock', 'pos', 'billing', 'reports'], sortOrder: 3 },
        { slug: 'enterprise', name: 'Enterprise', defaultMaxUsers: 50, defaultMaxWorkstations: 20, defaultModules: ['products', 'stock', 'pos', 'billing', 'reports', 'accounting', 'multi-store'], sortOrder: 4 },
    ];
    for (const lt of licenseTypes) {
        await models_1.LicenseType.findOneAndUpdate({ slug: lt.slug }, lt, { upsert: true });
    }
    logger_1.default.info('License types seeded');
    // Sample Products
    const products = [
        { slug: 'hardware-store', name: 'Gestion Quincaillerie', description: 'Logiciel de gestion pour quincaillerie', currentVersion: '1.0.0' },
        { slug: 'restaurant-pos', name: 'Restaurant POS', description: 'Point de vente pour restaurants', currentVersion: '1.0.0' },
        { slug: 'pharmacy-manager', name: 'Pharmacie Manager', description: 'Gestion de pharmacie', currentVersion: '1.0.0' },
        { slug: 'garage-system', name: 'Garage System', description: 'Gestion de garage automobile', currentVersion: '1.0.0' },
    ];
    for (const p of products) {
        const product = await models_1.Product.findOneAndUpdate({ slug: p.slug }, p, { upsert: true, new: true });
        const modules = [
            { slug: 'products', name: 'Produits', product: product._id, sortOrder: 1 },
            { slug: 'stock', name: 'Stock', product: product._id, sortOrder: 2 },
            { slug: 'pos', name: 'Point de Vente', product: product._id, sortOrder: 3 },
            { slug: 'billing', name: 'Facturation', product: product._id, sortOrder: 4 },
            { slug: 'reports', name: 'Rapports', product: product._id, sortOrder: 5 },
            { slug: 'accounting', name: 'Comptabilité', product: product._id, sortOrder: 6 },
            { slug: 'multi-store', name: 'Multi-magasins', product: product._id, sortOrder: 7 },
        ];
        for (const m of modules) {
            await models_1.Module.findOneAndUpdate({ product: product._id, slug: m.slug }, m, { upsert: true });
        }
        await models_1.AppVersion.findOneAndUpdate({ product: product._id, version: '1.0.0' }, {
            product: product._id,
            version: '1.0.0',
            releaseNotes: 'Version initiale',
            isRecommended: true,
            isActive: true,
        }, { upsert: true });
    }
    logger_1.default.info('Products, modules and versions seeded');
    logger_1.default.info('Seed completed successfully!');
    logger_1.default.info(`Login with: ${config_1.config.seed.adminEmail} / ${config_1.config.seed.adminPassword}`);
    await (0, database_1.disconnectDatabase)();
}
seed().catch((error) => {
    logger_1.default.error('Seed failed', { error });
    process.exit(1);
});
//# sourceMappingURL=seed.js.map