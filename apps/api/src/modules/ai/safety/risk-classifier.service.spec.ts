import { describe, expect, it } from 'vitest';
import { RiskClassifierService } from './risk-classifier.service.js';

describe('RiskClassifierService', () => {
  const classifier = new RiskClassifierService();

  it('blocks acute danger messages', () => {
    expect(classifier.classify('我胸痛而且呼吸困难')).toEqual({
      decision: 'block',
      reason: 'acute_symptom',
    });
  });

  it('blocks medication and diagnosis requests', () => {
    expect(classifier.classify('我应该停用降压药吗')).toEqual({
      decision: 'block',
      reason: 'medication_or_diagnosis',
    });
  });

  it('allows a lifestyle question', () => {
    expect(classifier.classify('今天外卖怎么搭配更均衡')).toEqual({ decision: 'allow' });
  });
});
