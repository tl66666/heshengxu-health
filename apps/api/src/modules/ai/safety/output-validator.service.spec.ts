import { describe, expect, it } from 'vitest';
import { OutputValidatorService } from './output-validator.service.js';

describe('OutputValidatorService', () => {
  const validator = new OutputValidatorService();

  it('rejects medication directions in provider output', () => {
    expect(validator.isSafe('请立刻停药并自行增加剂量')).toBe(false);
  });

  it('allows a general lifestyle suggestion', () => {
    expect(validator.isSafe('今天可以选择一份蔬菜、一份蛋白质和一份主食。')).toBe(true);
  });
});
