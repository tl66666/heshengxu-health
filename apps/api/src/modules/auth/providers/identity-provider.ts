export interface IdentityProvider {
  exchange(code: string): Promise<{ provider: 'wechat'; providerUserId: string }>;
}
