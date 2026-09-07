import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cacheAsset,
  remoteAssetUrl,
  resetAssetCacheForTests,
  resolveCachedAsset,
} from './asset-cache.js';

describe('persistent remote asset cache', () => {
  beforeEach(() => {
    resetAssetCacheForTests();
    vi.stubGlobal('uni', {
      getStorageSync: vi.fn(() => ({})),
      setStorageSync: vi.fn(),
      downloadFile: vi.fn(),
      saveFile: vi.fn(),
    });
  });

  it('falls back to the production CDN before a bitmap is cached', () => {
    expect(resolveCachedAsset('static/illustrations/xuxu-avatar.png')).toBe(
      'https://tl-d2ghzbl1p09ccaae3-1474520495.tcloudbaseapp.com/heban/static/illustrations/xuxu-avatar.png',
    );
    expect(remoteAssetUrl('/static/icons/svg/back.svg')).toBe('/static/icons/svg/back.svg');
    expect(uni.downloadFile).toHaveBeenCalledWith(expect.objectContaining({
      url: 'https://tl-d2ghzbl1p09ccaae3-1474520495.tcloudbaseapp.com/heban/static/illustrations/xuxu-avatar.png',
    }));
  });

  it('immediately resolves a cached bitmap to its persistent local path', () => {
    cacheAsset('static/illustrations/xuxu-avatar.png', '_doc/uniapp_save/avatar.png');
    expect(resolveCachedAsset('/static/illustrations/xuxu-avatar.png')).toBe(
      '_doc/uniapp_save/avatar.png',
    );
  });

  it('does not persist a temporary file when the platform cache is unavailable', async () => {
    const downloadFile = vi.fn(({ success }: { success: (value: { statusCode: number; tempFilePath: string }) => void }) =>
      success({ statusCode: 200, tempFilePath: '/tmp/asset.png' }));
    const saveFile = vi.fn(({ fail }: { fail: () => void }) => fail());
    vi.stubGlobal('uni', {
      getStorageSync: vi.fn(() => ({})),
      setStorageSync: vi.fn(),
      downloadFile,
      saveFile,
    });

    const resolved = await import('./asset-cache.js').then(({ cacheRemoteAsset }) =>
      cacheRemoteAsset('static/illustrations/home-hero-morning.png'),
    );
    expect(resolved).toContain('https://tl-d2ghzbl1p09ccaae3-1474520495.tcloudbaseapp.com/heban/');
    expect(uni.setStorageSync).not.toHaveBeenCalled();
  });
});
