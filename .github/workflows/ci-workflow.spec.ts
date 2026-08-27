import { describe, expect, it } from 'vitest';
import ciWorkflowSource from './ci.yml?raw';

describe('CI workflow', () => {
  it('seeds the owned food catalog before API integration tests run', () => {
    const migrate = ciWorkflowSource.indexOf('pnpm --filter @heban/api prisma:deploy');
    const seed = ciWorkflowSource.indexOf('pnpm --filter @heban/api prisma db seed');
    const test = ciWorkflowSource.indexOf('pnpm test');

    expect(migrate).toBeGreaterThan(-1);
    expect(seed).toBeGreaterThan(migrate);
    expect(test).toBeGreaterThan(seed);
  });
});
