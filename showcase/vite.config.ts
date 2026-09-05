import { createReadStream, existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';

const showcaseRoot = fileURLToPath(new URL('.', import.meta.url));
const assetsRoot = resolve(showcaseRoot, '../assets');

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
      collectAssetFiles(assetsRoot).forEach((filePath) => {
        this.emitFile({
          type: 'asset',
          fileName: `assets/${relative(assetsRoot, filePath).replaceAll('\\', '/')}`,
          source: readFileSync(filePath),
        });
      });
    },
  };
}

function collectAssetFiles(directory: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(directory)) {
    const filePath = resolve(directory, entry);
    if (statSync(filePath).isDirectory()) files.push(...collectAssetFiles(filePath));
    else files.push(filePath);
  }
  return files;
}

export default defineConfig({
  root: showcaseRoot,
  publicDir: false,
  plugins: [repositoryAssetsPlugin()],
});
