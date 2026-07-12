import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { z } from 'zod';
import { ok, fail } from '../utils/response.js';
import { ROLE_PERMISSIONS } from '../utils/rbac.js';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = Number(process.env.LOCKOUT_MINUTES || 15);

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'Email is required')
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  role: z.nativeEnum(Role).optional(),
});

function lockMessage(until) {
  const mins = Math.max(1, Math.ceil((new Date(until) - new Date()) / 60000));
  return `Account locked after 5 failed attempts. Try again in ${mins} minute(s).`;
}

async function registerFailure(userId, currentAttempts) {
  const attempts = currentAttempts + 1;
  if (attempts >= MAX_ATTEMPTS) {
    const lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
    await prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: attempts,
        locked: true,
        lockedUntil,
      },
    });
    return { locked: true, lockedUntil };
  }
  await prisma.user.update({
    where: { id: userId },
    data: { failedLoginAttempts: attempts },
  });
  return { locked: false };
}

export async function login(req, res) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return fail(res, parsed.error.errors[0]?.message || 'Invalid login data', 400);
    }

    const { email, password, role } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return fail(res, 'Invalid credentials', 401);

    if (user.locked) {
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        return fail(res, lockMessage(user.lockedUntil), 403);
      }
      await prisma.user.update({
        where: { id: user.id },
        data: { locked: false, lockedUntil: null, failedLoginAttempts: 0 },
      });
      user.locked = false;
      user.failedLoginAttempts = 0;
    }

    if (role && user.role !== role) {
      const result = await registerFailure(user.id, user.failedLoginAttempts);
      if (result.locked) return fail(res, lockMessage(result.lockedUntil), 403);
      return fail(res, 'Invalid credentials. Role does not match this account.', 401);
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      const result = await registerFailure(user.id, user.failedLoginAttempts);
      if (result.locked) return fail(res, lockMessage(result.lockedUntil), 403);
      const left = MAX_ATTEMPTS - (user.failedLoginAttempts + 1);
      return fail(res, `Invalid credentials. ${left} attempt(s) remaining before lockout.`, 401);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, locked: false, lockedUntil: null },
    });

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return ok(
      res,
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          permissions: ROLE_PERMISSIONS[user.role],
        },
      },
      'Signed in'
    );
  } catch (err) {
    console.error(err);
    if (err.code === 'P2024' || err.message?.includes('connection pool')) {
      return fail(res, 'Database is busy — wait a few seconds and try again.', 503);
    }
    return fail(res, 'Login failed — check API/database connection', 500);
  }
}

export async function me(req, res) {
  return ok(res, {
    ...req.user,
    permissions: ROLE_PERMISSIONS[req.user.role],
  });
}
