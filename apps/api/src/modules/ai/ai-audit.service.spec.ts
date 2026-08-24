import { describe, expect, it } from 'vitest';
import { AiAuditService } from './ai-audit.service.js';

describe('AiAuditService', () => {
  it('stores a request hash instead of the raw user message', async () => {
    const traces: Array<Record<string, string>> = [];
    const service = new AiAuditService({ save: async (trace) => void traces.push(trace) });

    await service.record({
      userId: 'user-a',
      message: '我今天睡眠不太好',
      safetyDecision: 'allow',
    });

    expect(traces).toHaveLength(1);
    expect(traces[0]).toMatchObject({ userId: 'user-a', safetyDecision: 'allow' });
    expect(traces[0]?.requestHash).not.toBe('我今天睡眠不太好');
  });
});
