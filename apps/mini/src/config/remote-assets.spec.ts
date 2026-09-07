import { describe, expect, it } from 'vitest';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  normalizeRemoteAssetBaseUrl,
  pruneGeneratedAppIcons,
  remoteMiniAssetsPlugin,
  rewriteCachedTemplateBitmapUrls,
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

  it('routes static template bitmaps through the persistent asset cache', () => {
    const source = [
      '<image src="/static/illustrations/hero.jpg" />',
      '<image :src="imagePath" />',
      '<image src="/static/icons/svg/back.svg" />',
    ].join('\n');

    expect(rewriteCachedTemplateBitmapUrls(source)).toBe(
      [
        '<image :src="$asset(\'static/illustrations/hero.jpg\')" />',
        '<image :src="imagePath" />',
        '<image src="/static/icons/svg/back.svg" />',
      ].join('\n'),
    );
  });

  it('does not transform test fixtures when the production asset base is configured', () => {
    const plugin = remoteMiniAssetsPlugin('https://assets.example.com/heban');
    const transform = plugin.transform;

    expect(typeof transform).toBe('function');
    const result =
      typeof transform === 'function'
        ? Reflect.apply(transform, plugin, [`const asset = '/static/icons/test.png';`, 'remote-assets.spec.ts'])
        : transform
          ? Reflect.apply(transform.handler, plugin, [
              `const asset = '/static/icons/test.png';`,
              'remote-assets.spec.ts',
            ])
          : undefined;
    expect(result).toBeNull();
  });
});

describe('mini program package cleanup', () => {
  it('removes App-only icons from generated WeChat output', async () => {
    const root = await mkdtemp(join(tmpdir(), 'heban-mini-'));
    const icons = join(root, 'dist', 'build', 'mp-weixin', 'static', 'app-icons');
    mkdirSync(icons, { recursive: true });
    writeFileSync(join(icons, 'ios-appstore.png'), Buffer.alloc(1024));

    expect(pruneGeneratedAppIcons(root, 'mp-weixin')).toBe(1);
    expect(existsSync(join(icons, 'ios-appstore.png'))).toBe(false);
    await rm(root, { recursive: true, force: true });
  });
});
