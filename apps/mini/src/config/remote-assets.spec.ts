import { describe, expect, it } from 'vitest';
import {
  normalizeRemoteAssetBaseUrl,
  rewriteRemoteBitmapUrls,
} from '../../build/remote-assets.js';

describe('remote mini-program assets', () => {
  it('rewrites bitmap assets while preserving svg icons and temporary image paths', () => {
    const source = [
      'src="/static/illustrations/hero.jpg"',
      "icon: '/static/icons/watercolor/sleep.png'",
      'src="/static/icons/svg/back.svg"',
      ':src="imagePath"',
    ].join('\n');

    expect(rewriteRemoteBitmapUrls(source, 'https://assets.example.com/heban')).toBe(
      [
        'src="https://assets.example.com/heban/static/illustrations/hero.jpg"',
        "icon: 'https://assets.example.com/heban/static/icons/watercolor/sleep.png'",
        'src="/static/icons/svg/back.svg"',
        ':src="imagePath"',
      ].join('\n'),
    );
  });

  it('requires an https origin and removes trailing slashes', () => {
    expect(normalizeRemoteAssetBaseUrl(' https://assets.example.com/heban/ ')).toBe(
      'https://assets.example.com/heban',
    );
    expect(() => normalizeRemoteAssetBaseUrl('http://assets.example.com')).toThrow('HTTPS');
  });

  it('does not prefix bitmap URLs that are already remote', () => {
    const baseUrl = 'https://assets.example.com/heban';
    const source = `icon: '${baseUrl}/static/icons/breakfast.png'`;

    expect(rewriteRemoteBitmapUrls(source, baseUrl)).toBe(source);
    expect(rewriteRemoteBitmapUrls(rewriteRemoteBitmapUrls(source, baseUrl), baseUrl)).toBe(source);
  });
});
