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
    transform(source, id) {
      if (!baseUrl || id.includes('node_modules')) return null;
      if (!/\.(?:vue|[cm]?[jt]s|s?css)(?:\?|$)/iu.test(id)) return null;
      const code = rewriteRemoteBitmapUrls(source, baseUrl);
      return code === source ? null : { code, map: null };
    },
  };
}
