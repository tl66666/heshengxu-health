import { describe, expect, it } from 'vitest';
import { existsSync, mkdirSync, writeFileSync, symlinkSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  normalizeRemoteAssetBaseUrl,
  pruneGeneratedAppIcons,
  pruneGeneratedRemoteAppBitmaps,
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
        ? Reflect.apply(transform, plugin, [
            `const asset = '/static/icons/test.png';`,
            'remote-assets.spec.ts',
          ])
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

describe('App output remote assets', () => {
  it('refuses an output junction that points back to source files', async () => {
    const root = await mkdtemp(join(tmpdir(), 'heban-app-assets-'));
    const source = join(root, 'src');
    mkdirSync(join(source, 'static'), { recursive: true });
    writeFileSync(join(source, 'static', 'hero.png'), 'source');
    mkdirSync(join(root, 'dist', 'build'), { recursive: true });
    symlinkSync(source, join(root, 'dist', 'build', 'app'), 'junction');
    expect(pruneGeneratedRemoteAppBitmaps(root, 'app')).toBe(0);
    expect(existsSync(join(source, 'static', 'hero.png'))).toBe(true);
    await rm(root, { recursive: true, force: true });
  });
  it('handles the HBuilderX app-plus output and keeps source and other builds intact', async () => {
    const root = await mkdtemp(join(tmpdir(), 'heban-app-assets-'));
    const source = join(root, 'src', 'static', 'icons');
    const generated = join(root, 'dist', 'build', 'app-plus', 'static', 'icons');
    const other = join(root, 'dist', 'build', 'app', 'static', 'icons');
    for (const dir of [source, generated, other]) {
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, 'hero.png'), 'image');
    }
    writeFileSync(join(generated, 'back.svg'), '<svg/>');
    expect(
      pruneGeneratedRemoteAppBitmaps(root, 'app', join(root, 'dist', 'build', 'app-plus')),
    ).toBe(1);
    expect(existsSync(join(generated, 'hero.png'))).toBe(false);
    expect(existsSync(join(source, 'hero.png'))).toBe(true);
    expect(existsSync(join(other, 'hero.png'))).toBe(true);
    expect(existsSync(join(generated, 'back.svg'))).toBe(true);
    await rm(root, { recursive: true, force: true });
  });
  it('never processes source or App output while building WeChat', async () => {
    const root = await mkdtemp(join(tmpdir(), 'heban-app-assets-'));
    const source = join(root, 'src', 'static');
    mkdirSync(source, { recursive: true });
    writeFileSync(join(source, 'hero.png'), 'image');
    expect(pruneGeneratedRemoteAppBitmaps(root, 'app', join(root, 'src'))).toBe(0);
    expect(pruneGeneratedRemoteAppBitmaps(root, 'mp-weixin', join(root, 'src'))).toBe(0);
    expect(existsSync(join(source, 'hero.png'))).toBe(true);
    await rm(root, { recursive: true, force: true });
  });
});
