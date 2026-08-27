import { describe, expect, it } from 'vitest';
import verifierSource from './verify-mini-build.mjs?raw';

describe('mini build verifier', () => {
  it('accepts the WeChat app template filename on case-sensitive filesystems', () => {
    expect(verifierSource).toContain("['app.wxml', 'App.wxml']");
  });
});
