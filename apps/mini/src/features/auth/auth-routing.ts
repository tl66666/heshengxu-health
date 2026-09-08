export type NativeAuthPlatform = 'app' | 'app-plus' | 'mp-weixin' | string | undefined;

export function resolveAuthEntry({
  platform,
  signedIn,
}: {
  platform: NativeAuthPlatform;
  signedIn: boolean;
}) {
  if (signedIn) return null;
  if (platform === 'app' || platform === 'app-plus') return '/pages/auth/AppAuthPage';
  if (platform === 'mp-weixin') return '/pages/auth/WechatAuthPage';
  return null;
}

export function currentUniPlatform(): NativeAuthPlatform {
  try {
    return uni.getSystemInfoSync().uniPlatform;
  } catch {
    return undefined;
  }
}
