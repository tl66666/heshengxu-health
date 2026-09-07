import { createSSRApp } from 'vue';
import App from './App.vue';
import { resolveCachedAsset } from './config/asset-cache.js';

export function createApp() {
  const app = createSSRApp(App);
  app.config.globalProperties.$asset = resolveCachedAsset;
  return { app };
}
