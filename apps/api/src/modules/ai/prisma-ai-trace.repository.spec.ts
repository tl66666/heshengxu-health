import { describe, expect, it } from 'vitest';
import { PrismaAiTraceRepository } from './prisma-ai-trace.repository.js';

describe('PrismaAiTraceRepository', () => {
  it('persists only audit metadata and never a raw message', async () => {
    let created: Record<string, unknown> | undefined;
    const repository = new PrismaAiTraceRepository({
      aiTrace: {
        create: async ({ data }: { data: Record<string, unknown> }) => {
          created = data;
        },
      },
    } as never);

    await repository.save({
      userId: 'user-a',
      requestHash: 'sha256-value',
      safetyDecision: 'block',
      safetyReason: 'acute_symptom',
    });

    expect(created).toMatchObject({
      userId: 'user-a',
      requestHash: 'sha256-value',
      safetyDecision: 'block',
      safetyReason: 'acute_symptom',
    });
    expect(created).not.toHaveProperty('message');
    expect(created).not.toHaveProperty('prompt');
    expect(created).not.toHaveProperty('response');
    expect(created).not.toHaveProperty('token');
    expect(created).not.toHaveProperty('apiKey');
  });
});
