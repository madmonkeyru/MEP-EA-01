import { createHmac, randomBytes, timingSafeEqual, scryptSync } from 'node:crypto';
import type { AuthSession } from '@mep-ea/api';
import type { SessionVerifier } from './service';

export interface UserAccount {
  id: string;
  username: string; // or email
  passwordHash: string; // salt:hash in hex
  tier: 'free' | 'premium';
  roles: ('learner' | 'content_admin' | 'platform_admin')[];
  createdAt: string;
  updatedAt: string;
}

export interface UserAccountRepository {
  findByUsername(username: string): Promise<UserAccount | null>;
  findById(id: string): Promise<UserAccount | null>;
  create(account: UserAccount): Promise<UserAccount>;
  updateTier?(id: string, tier: 'free' | 'premium'): Promise<UserAccount | null>;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 32).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, expectedHash] = stored.split(':');
  if (!salt || !expectedHash) return false;
  const hash = scryptSync(password, salt, 32).toString('hex');
  const expectedBuf = Buffer.from(expectedHash, 'hex');
  const hashBuf = Buffer.from(hash, 'hex');
  return expectedBuf.length === hashBuf.length && timingSafeEqual(expectedBuf, hashBuf);
}

export interface TokenPayload {
  sub: string; // learnerId
  tier: 'free' | 'premium';
  roles: ('learner' | 'content_admin' | 'platform_admin')[];
  exp: number; // Unix timestamp in seconds
}

export class TokenLifecycleManager implements SessionVerifier {
  private secret: Buffer;

  constructor(secretKey: string | Buffer) {
    this.secret = typeof secretKey === 'string' ? Buffer.from(secretKey, 'utf8') : secretKey;
    if (this.secret.length < 32) {
      throw new Error('TokenLifecycleManager secret must be at least 32 bytes');
    }
  }

  issueToken(account: Pick<UserAccount, 'id' | 'tier' | 'roles'>, expiresInSeconds = 86400): { token: string; expiresAt: string } {
    const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const payload: TokenPayload = {
      sub: account.id,
      tier: account.tier,
      roles: account.roles,
      exp,
    };
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = createHmac('sha256', this.secret).update(`${header}.${body}`).digest('base64url');
    const token = `${header}.${body}.${signature}`;
    return { token, expiresAt: new Date(exp * 1000).toISOString() };
  }

  async verify(accessToken: string): Promise<AuthSession | null> {
    try {
      const parts = accessToken.split('.');
      if (parts.length !== 3) return null;
      const [header, body, signature] = parts;
      const expectedSignature = createHmac('sha256', this.secret).update(`${header}.${body}`).digest('base64url');
      const sigBuf = Buffer.from(signature, 'utf8');
      const expBuf = Buffer.from(expectedSignature, 'utf8');
      if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
        return null;
      }
      const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as TokenPayload;
      const nowSec = Math.floor(Date.now() / 1000);
      if (!payload.exp || payload.exp <= nowSec) {
        return null;
      }
      return {
        kind: 'authenticated',
        learnerId: payload.sub,
        tier: payload.tier,
        roles: payload.roles,
        accessToken,
        expiresAt: new Date(payload.exp * 1000).toISOString(),
      };
    } catch {
      return null;
    }
  }
}
