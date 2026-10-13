import { existsSync, lstatSync, readdirSync, realpathSync, statSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Plugin } from 'vite';

const LOCAL_BITMAP_PATH = /(^|["'`(\s])\/static\/[^"'`\s)]+\.(?:png|jpe?g|webp|gif)/giu;
const STATIC_TEMPLATE_BITMAP =
  /(^|\s)src=(?:"|')\/static\/([^"']+\.(?:png|jpe?g|webp|gif))(?:"|')/giu;

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

export function rewriteCachedTemplateBitmapUrls(source: string) {
  return source.replace(
    STATIC_TEMPLATE_BITMAP,
    (_match, prefix: string, path: string) => `${prefix}:src="$asset('static/${path}')"`,
  );
}

export function remoteMiniAssetsPlugin(value?: string): Plugin {
  const baseUrl = normalizeRemoteAssetBaseUrl(value);

  return {
    name: 'heban-remote-mini-assets',
    enforce: 'pre',
    closeBundle() {
      const platform = process.env.UNI_PLATFORM ?? '';
      const prunedIcons = pruneGeneratedAppIcons(process.cwd(), platform);
      if (prunedIcons > 0) {
        console.log(`[heban] removed ${prunedIcons} App-only icons from the Mini Program package`);
      }
      if (!baseUrl) return;
      const remoteized = pruneGeneratedRemoteAppBitmaps(
        process.cwd(),
        platform,
        process.env.UNI_OUTPUT_DIR,
      );
      if (remoteized > 0) {
        console.log(
          `[heban] remoteized ${remoteized} bitmap assets in current App output; source preserved`,
        );
      }
    },
    transform(source, id) {
      if (process.env.NODE_ENV === 'test') return null;
      if (!baseUrl || id.includes('node_modules')) return null;
      if (/(?:^|[./])[^/]+\.(?:spec|test)\.[cm]?[jt]sx?$/iu.test(id)) return null;
      if (!/\.(?:vue|[cm]?[jt]s|s?css)(?:\?|$)/iu.test(id)) return null;
      const cachedTemplates = id.includes('.vue')
        ? rewriteCachedTemplateBitmapUrls(source)
        : source;
      const code = rewriteRemoteBitmapUrls(cachedTemplates, baseUrl);
      return code === source ? null : { code, map: null };
    },
  };
}

/** Only the active generated App output can be pruned; HBuilderX uses app-plus. */
export function pruneGeneratedRemoteAppBitmaps(root: string, platform: string, outputDir?: string) {
  if (platform !== 'app' && platform !== 'app-plus') return 0;
  const allowed = ['app', 'app-plus'].map((name) =>
    resolve(realpathSync(root), 'dist/build', name),
  );
  const output = resolve(outputDir || resolve(root, 'dist/build', platform));
  if (!existsSync(output)) return 0;
  const actual = realpathSync(output);
  if (!allowed.includes(actual)) return 0;
  const staticDir = resolve(output, 'static');
  if (!existsSync(staticDir) || lstatSync(staticDir).isSymbolicLink()) return 0;
  const files = collectFiles(staticDir).filter((file) => /\.(?:png|jpe?g|webp|gif)$/iu.test(file));
  for (const file of files) unlinkSync(file);
  return files.length;
}

export function pruneGeneratedAppIcons(root: string, platform: string) {
  if (platform !== 'mp-weixin') return 0;
  const candidates = [
    resolve(root, 'dist/build/mp-weixin/static/app-icons'),
    resolve(root, 'dist/dev/mp-weixin/static/app-icons'),
    resolve(root, 'apps/mini/dist/build/mp-weixin/static/app-icons'),
    resolve(root, 'apps/mini/dist/dev/mp-weixin/static/app-icons'),
  ];
  let removed = 0;
  for (const directory of candidates) {
    if (!existsSync(directory)) continue;
    for (const file of collectFiles(directory)) {
      unlinkSync(file);
      removed += 1;
    }
  }
  return removed;
}

function collectFiles(directory: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(directory)) {
    const path = resolve(directory, entry);
    if (lstatSync(path).isSymbolicLink()) continue;
    if (statSync(path).isDirectory()) files.push(...collectFiles(path));
    else files.push(path);
  }
  return files;
}
