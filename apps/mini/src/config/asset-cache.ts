import { reactive } from 'vue';

const ASSET_BASE_URL =
  'https://tl-d2ghzbl1p09ccaae3-1474520495.tcloudbaseapp.com/heban';
const CACHE_KEY = 'heban.remote-assets.v2';
const BITMAP_PATH = /^\/?static\/.+\.(?:png|jpe?g|webp|gif)$/iu;

export const CRITICAL_ASSET_PATHS = [
  'static/illustrations/xuxu-avatar.png',
  'static/illustrations/home-hero-morning.png',
  'static/illustrations/home-companion-banner.png',
  'static/illustrations/onboarding-guide-vertical.png',
  'static/illustrations/medication-companion-banner.png',
  'static/illustrations/program-sleep.png',
  'static/illustrations/weight-weighing-scene.png',
  'static/icons/watercolor/water-drop.png',
  'static/icons/watercolor/activity.png',
  'static/icons/watercolor/mood-smile.png',
] as const;

const cachedAssets = reactive<Record<string, string>>({});
const pending = new Map<string, Promise<string>>();
let loaded = false;

function normalizePath(path: string) {
  return path.replace(/^\/+/, '');
}

function loadCache() {
  if (loaded) return;
  loaded = true;
  try {
    const stored = uni.getStorageSync(CACHE_KEY);
    if (stored && typeof stored === 'object') Object.assign(cachedAssets, stored);
  } catch {
    // Remote URLs remain available when storage is unavailable.
  }
}

export function remoteAssetUrl(path: string) {
  const normalized = normalizePath(path);
  return BITMAP_PATH.test(normalized) ? `${ASSET_BASE_URL}/${normalized}` : path;
}

export function resolveCachedAsset(path: string) {
  loadCache();
  const normalized = normalizePath(path);
  if (cachedAssets[normalized]) return cachedAssets[normalized];
  const remote = remoteAssetUrl(path);
  // Start warming every bitmap on first render. The first frame can still use
  // the CDN URL, while subsequent page opens resolve directly to the saved
  // local file instead of waiting for the network again.
  if (BITMAP_PATH.test(normalized) && remote !== path) void cacheRemoteAsset(normalized);
  return remote;
}

export function cacheAsset(path: string, localPath: string) {
  loadCache();
  const normalized = normalizePath(path);
  cachedAssets[normalized] = localPath;
  try {
    uni.setStorageSync(CACHE_KEY, { ...cachedAssets });
  } catch {
    // The in-memory path still prevents another download during this session.
  }
  return localPath;
}

export function preloadCriticalAssets() {
  return Promise.allSettled(CRITICAL_ASSET_PATHS.map((path) => cacheRemoteAsset(path)));
}

export function cacheRemoteAsset(path: string): Promise<string> {
  loadCache();
  const normalized = normalizePath(path);
  if (cachedAssets[normalized]) return Promise.resolve(cachedAssets[normalized]);
  const active = pending.get(normalized);
  if (active) return active;

  const operation = downloadAndPersist(normalized).finally(() => pending.delete(normalized));
  pending.set(normalized, operation);
  return operation;
}

function downloadAndPersist(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    uni.downloadFile({
      url: remoteAssetUrl(path),
      success: ({ statusCode, tempFilePath }) => {
        if (statusCode < 200 || statusCode >= 300 || !tempFilePath) {
          reject(new Error(`ASSET_DOWNLOAD_${statusCode}`));
          return;
        }
        uni.saveFile({
          tempFilePath,
          success: ({ savedFilePath }) => resolve(cacheAsset(path, savedFilePath || tempFilePath)),
          // A temporary path is not valid after the process exits. Fall back
          // to the CDN instead of persisting a broken reference.
          fail: () => resolve(remoteAssetUrl(path)),
        });
      },
      fail: reject,
    });
  });
}

export function resetAssetCacheForTests() {
  Object.keys(cachedAssets).forEach((key) => delete cachedAssets[key]);
  pending.clear();
  loaded = false;
}
