import { describe, expect, it, vi } from 'vitest';
import { TokenService } from './token.service.js';

describe('TokenService', () => {
  it('issues and verifies a signed access token', async () => {
    const prisma = { authSession: { create: vi.fn().mockResolvedValue(undefined) } } as never;
    const service = new TokenService(prisma);
    const issued = await service.issue('user-1', 'wechat');
    expect(service.verifyAccess(issued.accessToken)).toMatchObject({ sub: 'user-1', typ: 'access' });
  });

  it('rejects tampered access tokens', () => {
    const service = new TokenService({} as never);
    expect(() => service.verifyAccess('bad.token')).toThrow();
  });
});
