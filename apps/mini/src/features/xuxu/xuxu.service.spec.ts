import { describe, expect, it, vi } from 'vitest';
import { chatWithXuxu } from './xuxu.service.js';

vi.mock('../../services/mini-api.js', () => ({
  createMiniApiClient: () => ({ post: vi.fn().mockResolvedValue({ message: { role: 'assistant', content: '收到' }, model: 'hy3' }) }),
}));

describe('xuxu service', () => {
  it('sends conversation messages to the API', async () => {
    await expect(chatWithXuxu([{ role: 'user', content: '今天有点累' }])).resolves.toMatchObject({ model: 'hy3' });
  });
});
