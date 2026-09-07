import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { extname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';

const showcaseRoot = fileURLToPath(new URL('.', import.meta.url));
const assetsRoot = resolve(showcaseRoot, '../assets');
const showcaseAssets = [
  'illustrations/hero.jpg',
  'illustrations/plan-hero-journal.png',
  'illustrations/program-mood.png',
  'illustrations/weekly-insight-banner.png',
  'illustrations/insight-report-banner.png',
  'illustrations/xuxu-avatar.jpg',
  'showcase/runtime/food-catalog.jpg',
  'showcase/runtime/food-recognition.jpg',
  'showcase/runtime/health-records.jpg',
  'showcase/runtime/home.jpg',
  'showcase/runtime/onboarding.jpg',
  'showcase/runtime/plans.jpg',
  'showcase/runtime/weight-management.jpg',
  'showcase/runtime/xuxu-chat.jpg',
  'showcase/mini-program-code.jpg',
];

const contentTypes: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

function repositoryAssetsPlugin(): Plugin {
  return {
    name: 'heban-showcase-assets',
    configureServer(server) {
      server.middlewares.use('/assets', (request, response, next) => {
        const requestPath = decodeURIComponent((request.url || '').split('?')[0]);
        const filePath = resolve(assetsRoot, `.${requestPath}`);
        const relativePath = relative(assetsRoot, filePath);
        if (relativePath.startsWith('..') || relativePath.includes(':') || !existsSync(filePath)) {
          next();
          return;
        }
        if (!statSync(filePath).isFile()) {
          next();
          return;
        }
        response.statusCode = 200;
        response.setHeader(
          'Content-Type',
          contentTypes[extname(filePath).toLowerCase()] || 'application/octet-stream',
        );
        createReadStream(filePath).pipe(response);
      });
    },
    generateBundle() {
      showcaseAssets.forEach((assetPath) => {
        const filePath = resolve(assetsRoot, assetPath);
        this.emitFile({
          type: 'asset',
          fileName: `assets/${assetPath}`,
          source: readFileSync(filePath),
        });
      });
    },
  };
}

export default defineConfig({
  root: showcaseRoot,
  publicDir: false,
  plugins: [repositoryAssetsPlugin()],
  build: {
    emptyOutDir: true,
  },
});
