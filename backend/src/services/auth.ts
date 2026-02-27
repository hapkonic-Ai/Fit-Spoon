import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { JWT } from '../lib/constants.js';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? 'fallback-secret');

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signToken(userId: string, email: string): Promise<string> {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(JWT.EXPIRES_IN)
    .sign(SECRET);
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, SECRET);
  return payload;
}
