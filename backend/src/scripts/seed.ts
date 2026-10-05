import { connectDatabase, disconnectDatabase } from '../config/database';
import { User, Product, Module, LicenseType, AppVersion } from '../models';
import { UserRole } from '../types';
import { config } from '../config';
import logger from '../utils/logger';

async function seed() {
  await connectDatabase();

  logger.info('Starting database seed...');

  // Super Admin
  const existingAdmin = await User.findOne({ email: config.seed.adminEmail });
  let admin = existingAdmin;
  if (!admin) {
    admin = await User.create({
      email: config.seed.adminEmail,
      password: config.seed.adminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: UserRole.SUPER_ADMIN,
    });
    logger.info(`Super Admin created: ${admin.email}`);
  }

  // License Types
  const licenseTypes = [
    { slug: 'basic', name: 'Basic', defaultMaxUsers: 2, defaultMaxWorkstations: 1, defaultModules: ['products', 'stock'], sortOrder: 1 },
    { slug: 'standard', name: 'Standard', defaultMaxUsers: 5, defaultMaxWorkstations: 2, defaultModules: ['products', 'stock', 'pos'], sortOrder: 2 },
    { slug: 'pro', name: 'Pro', defaultMaxUsers: 15, defaultMaxWorkstations: 5, defaultModules: ['products', 'stock', 'pos', 'billing', 'reports'], sortOrder: 3 },
    { slug: 'enterprise', name: 'Enterprise', defaultMaxUsers: 50, defaultMaxWorkstations: 20, defaultModules: ['products', 'stock', 'pos', 'billing', 'reports', 'accounting', 'multi-store'], sortOrder: 4 },
  ];

  for (const lt of licenseTypes) {
    await LicenseType.findOneAndUpdate({ slug: lt.slug, product: { $exists: false } }, lt, { upsert: true });
  }
  logger.info('License types seeded');

  // Sample Products
  const products = [
    { slug: 'hardware-store', name: 'Gestion Quincaillerie', description: 'Logiciel de gestion pour quincaillerie', currentVersion: '1.0.0' },
    { slug: 'restaurant-pos', name: 'Restaurant POS', description: 'Point de vente pour restaurants', currentVersion: '1.0.0' },
    { slug: 'pharmacy-manager', name: 'Pharmacie Manager', description: 'Gestion de pharmacie', currentVersion: '1.0.0' },
    { slug: 'garage-system', name: 'Garage System', description: 'Gestion de garage automobile', currentVersion: '1.0.0' },
  ];

  for (const p of products) {
    const product = await Product.findOneAndUpdate({ slug: p.slug }, p, { upsert: true, new: true });

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
      await Module.findOneAndUpdate(
        { product: product._id, slug: m.slug },
        m,
        { upsert: true }
      );
    }

    await AppVersion.findOneAndUpdate(
      { product: product._id, version: '1.0.0' },
      {
        product: product._id,
        version: '1.0.0',
        releaseNotes: 'Version initiale',
        isRecommended: true,
        isActive: true,
      },
      { upsert: true }
    );
  }

  logger.info('Products, modules and versions seeded');
  logger.info('Seed completed successfully!');
  logger.info(`Login with: ${config.seed.adminEmail} / ${config.seed.adminPassword}`);

  await disconnectDatabase();
}

seed().catch((error) => {
  logger.error('Seed failed', { error });
  process.exit(1);
});
