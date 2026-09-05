import { existsSync, readdirSync, statSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Plugin } from 'vite';

const LOCAL_BITMAP_PATH = /(^|["'`(\s])\/static\/[^"'`\s)]+\.(?:png|jpe?g|webp|gif)/giu;

export function normalizeRemoteAssetBaseUrl(value?: string) {
  const normalized = value?.trim().replace(/\/+$/u, '') || '';
  if (normalized && !normalized.startsWith('https://')) {
    throw new Error('VITE_MINI_ASSET_BASE_URL must use HTTPS');
  }
  return normalized;
}

export function rewriteRemoteBitmapUrls(source: string, baseUrl: string) {
  const normalized = normalizeRemoteAssetBaseUrl(baseUrl);
  return normalized
    ? source.replace(LOCAL_BITMAP_PATH, (path, prefix: string) => {
        return `${prefix}${normalized}${path.slice(prefix.length)}`;
      })
    : source;
}

export function remoteMiniAssetsPlugin(value?: string): Plugin {
  const baseUrl = normalizeRemoteAssetBaseUrl(value);

  return {
    name: 'heban-remote-mini-assets',
    enforce: 'pre',
    closeBundle() {
      // App packages are uploaded to HBuilderX as a single archive. Once the
      // source references point at CloudBase, keeping the same bitmaps locally
      // only increases the archive size and can make cloud packaging stop at
      // the 40% upload stage. Restrict cleanup to the generated App directory;
      // Mini Program output and the repository source assets remain untouched.
      if (!baseUrl) return;

      const appStaticDir = [
        resolve(process.cwd(), 'dist/build/app/static'),
        resolve(process.cwd(), 'apps/mini/dist/build/app/static'),
      ].find((directory) => existsSync(directory));
      if (!appStaticDir) return;

      const bitmapFiles = collectFiles(appStaticDir).filter((file) =>
        /\.(?:png|jpe?g|webp|gif)$/iu.test(file),
      );
      bitmapFiles.forEach((file) => unlinkSync(file));
      if (bitmapFiles.length > 0) {
        console.log(`[heban] remoteized ${bitmapFiles.length} bitmap assets for the App package`);
      }
    },
    transform(source, id) {
      if (process.env.NODE_ENV === 'test') return null;
      if (!baseUrl || id.includes('node_modules')) return null;
      if (/(?:^|[./])[^/]+\.(?:spec|test)\.[cm]?[jt]sx?$/iu.test(id)) return null;
      if (!/\.(?:vue|[cm]?[jt]s|s?css)(?:\?|$)/iu.test(id)) return null;
      const code = rewriteRemoteBitmapUrls(source, baseUrl);
      return code === source ? null : { code, map: null };
    },
  };
}

function collectFiles(directory: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(directory)) {
    const path = resolve(directory, entry);
    if (statSync(path).isDirectory()) files.push(...collectFiles(path));
    else files.push(path);
  }
  return files;
}
