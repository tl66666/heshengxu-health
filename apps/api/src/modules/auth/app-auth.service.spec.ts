import { describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service.js';
import type { PrismaService } from '../../common/database/prisma.service.js';
import type { TokenService } from './tokens/token.service.js';

describe('App account authentication', () => {
  it('registers an account before issuing app tokens', async () => {
    const prisma = {
      appCredential: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi
          .fn()
          .mockImplementation(({ data }: { data: { userId: string; email: string } }) =>
            Promise.resolve(data),
          ),
      },
      user: {
        create: vi
          .fn()
          .mockImplementation(({ data }: { data: { id: string } }) => Promise.resolve(data)),
      },
    } as unknown as PrismaService;
    const tokens = { issue: vi.fn() } as unknown as TokenService;
    const service = new AuthService(prisma, tokens);

    const result = await service.registerWithPassword(' Hello@Example.com ', 'strong-pass-1');

    expect(result).toEqual({
      userId: expect.stringMatching(/^[0-9a-f-]{36}$/),
      provider: 'app_password',
    });
    expect(result.userId).toMatch(/^[0-9a-f-]{36}$/);
    expect(prisma.user.create).toHaveBeenCalledOnce();
    expect(prisma.appCredential.create).toHaveBeenCalledOnce();
    expect(tokens.issue).not.toHaveBeenCalled();
  });

  it('rejects an invalid password without issuing tokens', async () => {
    const prisma = {
      appCredential: {
        findUnique: vi.fn().mockResolvedValue({ userId: 'user-1', passwordHash: 'scrypt$invalid' }),
      },
    } as unknown as PrismaService;
    const tokens = { issue: vi.fn() } as unknown as TokenService;
    const service = new AuthService(prisma, tokens);

    await expect(service.loginWithPassword('hello@example.com', 'wrong-pass')).rejects.toThrow(
      '账号或密码错误',
    );
    expect(tokens.issue).not.toHaveBeenCalled();
  });
});
