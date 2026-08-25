import { describe, expect, it } from 'vitest';
import { createRuleReply, createUserMessage, quickQuestions } from './xuxu-chat.js';

describe('Xuxu chat contracts', () => {
  it('provides demo-led quick questions', () => {
    expect(quickQuestions.map((item) => item.id)).toEqual(['sleep', 'diet', 'activity', 'medical']);
  });

  it('creates a user message and a bounded rule reply', () => {
    const message = createUserMessage('最近睡不好怎么办？');
    expect(message.role).toBe('user');
    expect(message.text).toContain('睡不好');
    expect(createRuleReply(message.text)).toContain('规律');
  });

  it('keeps medical requests in the safety boundary', () => {
    expect(createRuleReply('我胸痛是不是心脏病')).toContain('不能替代医生');
  });
});
