import { defineConfig, type Plugin } from 'vite';
import uniPlugin from '@dcloudio/vite-plugin-uni';

const uni =
  (uniPlugin as unknown as { default?: () => Plugin }).default ??
  (uniPlugin as unknown as () => Plugin);

export default defineConfig({ plugins: [uni()] });
