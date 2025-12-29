// src/server/auth-utils.ts

export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);
  
  const key = await crypto.subtle.importKey(
    'raw',
    passwordData,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    key,
    256
  );

  return {
    hash: btoa(String.fromCharCode(...new Uint8Array(hashBuffer))),
    salt: btoa(String.fromCharCode(...salt))
  };
}

export async function verifyPassword(password: string, storedHash: string, storedSalt: string): Promise<boolean> {
  const salt = new Uint8Array(atob(storedSalt).split('').map(c => c.charCodeAt(0)));
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);

  const key = await crypto.subtle.importKey(
    'raw',
    passwordData,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    key,
    256
  );

  const computedHash = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
  return computedHash === storedHash;
}

// Simple JWT implementation using Hono's built-in jwt middleware capability or just web standard signing
// For simplicity and standard compliance, we'll use Hono's 'hono/jwt' which is worker compatible
import { sign, verify } from 'hono/jwt'

const JWT_SECRET = 'your-secret-key-change-in-prod-please-123456'; 

export async function createSessionToken(user: { id: number, email: string, role: string }) {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
  }
  return await sign(payload, JWT_SECRET)
}

export async function verifySessionToken(token: string) {
  try {
    return await verify(token, JWT_SECRET)
  } catch (e) {
    return null
  }
}
