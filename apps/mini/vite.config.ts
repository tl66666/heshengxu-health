import { defineConfig, loadEnv, type Plugin } from 'vite';
import uniPlugin from '@dcloudio/vite-plugin-uni';
import { remoteMiniAssetsPlugin } from './build/remote-assets.js';

const uni =
  (uniPlugin as unknown as { default?: () => Plugin }).default ??
  (uniPlugin as unknown as () => Plugin);

const PUBLIC_ASSET_BASE_URL = 'https://tl-d2ghzbl1p09ccaae3-1474520495.tcloudbaseapp.com/heban';

export default defineConfig(({ mode }) => {
  // Vite does not load .env files into process.env while evaluating this
  // config. Read the same public VITE_* values that are exposed to the app so
  // HBuilderX and CLI builds use identical asset handling.
  const env = loadEnv(mode, process.cwd(), '');
  const isAppBuild =
    process.env.UNI_PLATFORM === 'app' ||
    process.env.UNI_APP_PLATFORM === 'android' ||
    process.env.UNI_APP_PLATFORM === 'ios';
  const assetBaseUrl = env.VITE_MINI_ASSET_BASE_URL || (mode === 'production' || isAppBuild ? PUBLIC_ASSET_BASE_URL : '');

  return {
    plugins: [remoteMiniAssetsPlugin(assetBaseUrl), uni()],
  };
});
