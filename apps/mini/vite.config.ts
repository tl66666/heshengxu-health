import { defineConfig, type Plugin } from 'vite';
import uniPlugin from '@dcloudio/vite-plugin-uni';
import { remoteMiniAssetsPlugin } from './build/remote-assets.js';

const uni =
  (uniPlugin as unknown as { default?: () => Plugin }).default ??
  (uniPlugin as unknown as () => Plugin);

export default defineConfig({
  plugins: [remoteMiniAssetsPlugin(process.env.VITE_MINI_ASSET_BASE_URL), uni()],
});
