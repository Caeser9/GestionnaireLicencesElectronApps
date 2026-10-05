import jwt, { SignOptions } from 'jsonwebtoken';
import { LicenseType, Product, User } from '../models';
import { config } from '../config';
import { AppError, assertFound } from '../utils/AppError';
import { JwtPayload, UserRole } from '../types';
import { createAuditLog } from '../middleware/audit';
import { AuditAction, AuditResource } from '../types';
import { Request } from 'express';

export class AuthService {
  async login(email: string, password: string, req?: Request) {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !user.isActive) {
      throw new AppError('Identifiants invalides', 401);
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      throw new AppError('Identifiants invalides', 401);
    }

    user.lastLoginAt = new Date();
    await user.save();

    const payload: JwtPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      ...(user.productId ? { productId: user.productId.toString() } : {}),
    };

    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
    });

    await createAuditLog(payload, {
      action: AuditAction.LOGIN,
      resource: AuditResource.AUTH,
      description: `Connexion de ${user.email}`,
    }, req);

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        productId: user.productId?.toString(),
        fullName: user.fullName,
      },
    };
  }

  async getMe(userId: string) {
    const user = assertFound(await User.findById(userId), 'Utilisateur non trouvé');
    return {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      productId: user.productId?.toString(),
      fullName: user.fullName,
      lastLoginAt: user.lastLoginAt,
    };
  }

  async createUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    productId?: string;
  }, creator: JwtPayload, req?: Request) {
    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      throw new AppError('Cet email est déjà utilisé', 409);
    }

    if (data.role === UserRole.MODERATOR && !data.productId) {
      throw new AppError('Une application doit être associée au modérateur', 400);
    }
    if (data.role === UserRole.MODERATOR && !(await Product.exists({ _id: data.productId, isActive: true }))) {
      throw new AppError('Application introuvable ou inactive', 404);
    }
    if (data.role !== UserRole.MODERATOR && data.productId) {
      throw new AppError('Seul un modérateur peut être associé à une application', 400);
    }
    const user = await User.create(data);

    if (user.role === UserRole.MODERATOR && user.productId) {
      const sharedTypes = await LicenseType.find({ product: { $exists: false } });
      for (const sharedType of sharedTypes) {
        const scopedSlug = `${sharedType.slug}-${user.productId.toString().slice(-6)}`;
        await LicenseType.updateOne(
          { product: user.productId, slug: scopedSlug },
          { $setOnInsert: {
            product: user.productId,
            slug: scopedSlug,
            name: sharedType.name,
            description: sharedType.description,
            defaultMaxUsers: sharedType.defaultMaxUsers,
            defaultMaxWorkstations: sharedType.defaultMaxWorkstations,
            defaultModules: sharedType.defaultModules,
            sortOrder: sharedType.sortOrder,
            isActive: sharedType.isActive,
          } },
          { upsert: true }
        );
      }
    }

    await createAuditLog(creator, {
      action: AuditAction.CREATE,
      resource: AuditResource.USER,
      resourceId: user._id.toString(),
      description: `Création de l'utilisateur ${user.email}`,
    }, req);

    return user;
  }

  async listUsers() {
    return User.find().sort({ createdAt: -1 });
  }

  async updateUser(id: string, data: Partial<{
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
  }>, updater: JwtPayload, req?: Request) {
    const user = assertFound(await User.findById(id), 'Utilisateur non trouvé');

    if (data.email && data.email !== user.email) {
      const existing = await User.findOne({ email: data.email.toLowerCase() });
      if (existing) throw new AppError('Cet email est déjà utilisé', 409);
    }

    Object.assign(user, data);
    await user.save();

    await createAuditLog(updater, {
      action: AuditAction.UPDATE,
      resource: AuditResource.USER,
      resourceId: id,
      description: `Modification de l'utilisateur ${user.email}`,
      changes: data as Record<string, unknown>,
    }, req);

    return user;
  }
}

export const authService = new AuthService();
