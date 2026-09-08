import { describe, expect, it } from 'vitest';
import pageSource from './WechatAuthPage.vue?raw';

describe('WeChat authorization page', () => {
  it('offers an explicit WeChat login action without asking for a phone number', () => {
    expect(pageSource).toContain('微信授权登录');
    expect(pageSource).toContain('loginWithWechat');
    expect(pageSource).not.toContain('getPhoneNumber');
  });

  it('returns authenticated users to bootstrap profile resolution', () => {
    expect(pageSource).toContain("uni.reLaunch({ url: '/pages/bootstrap/BootstrapPage' })");
  });

  it('keeps authorization failures on the page with a readable retry state', () => {
    expect(pageSource).toContain('errorMessage.value');
    expect(pageSource).toContain('重新连接');
  });

  it('redirects App runtimes away from the WeChat-only page', () => {
    expect(pageSource).toContain('isAppRuntime()');
    expect(pageSource).toContain('/pages/auth/AppAuthPage');
  });
});
