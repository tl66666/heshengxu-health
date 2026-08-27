import { describe, expect, it } from 'vitest';
import verifierSource from './verify-mini-build.mjs?raw';

describe('mini build verifier', () => {
  it('does not require a legacy app template file absent from current uni output', () => {
    expect(verifierSource).not.toContain('App.wxml');
    expect(verifierSource).not.toContain('app.wxml');
  });
});
