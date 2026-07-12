import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { fail } from '../utils/response.js';
import { canAccess } from '../utils/rbac.js';

const prisma = new PrismaClient();

export async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return fail(res, 'Authentication required', 401);

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user || user.locked) return fail(res, 'Invalid or locked account', 401);

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    next();
  } catch {
    return fail(res, 'Invalid or expired token', 401);
  }
}

export function requirePermission(module, action = 'view') {
  return (req, res, next) => {
    if (!canAccess(req.user.role, module, action)) {
      return fail(res, `Access denied for ${module}`, 403);
    }
    next();
  };
}
