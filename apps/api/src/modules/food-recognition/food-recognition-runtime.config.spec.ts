import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { resolveFoodRecognitionRuntimeConfig } from './food-recognition-runtime.config.js';

describe('food recognition runtime configuration', () => {
  it('uses mock storage and recognition by default', () => {
    expect(resolveFoodRecognitionRuntimeConfig({})).toEqual({
      storageProvider: 'mock',
      visionProvider: 'mock',
    });
  });

  it('rejects CloudBase storage without server-only credentials', () => {
    expect(() =>
      resolveFoodRecognitionRuntimeConfig({ FOOD_RECOGNITION_STORAGE_PROVIDER: 'cloudbase' }),
    ).toThrow('CLOUDBASE_ENV_ID, TENCENTCLOUD_SECRET_ID, TENCENTCLOUD_SECRET_KEY');
  });

  it('rejects Hunyuan recognition without server-only credentials', () => {
    expect(() =>
      resolveFoodRecognitionRuntimeConfig({ FOOD_RECOGNITION_VISION_PROVIDER: 'hunyuan' }),
    ).toThrow('TENCENTCLOUD_SECRET_ID, TENCENTCLOUD_SECRET_KEY');
  });

  it('keeps server-only provider credentials out of mini-program source', async () => {
    const miniSourceDirectory = fileURLToPath(new URL('../../../../mini/src/', import.meta.url));
    const source = await readSourceTree(miniSourceDirectory);
    expect(source).not.toMatch(/(?:CLOUDBASE_SECRET|TENCENTCLOUD_SECRET|HUNYUAN_(?:API_)?KEY)/u);
  });
});

async function readSourceTree(directory: string): Promise<string> {
  const entries = await readdir(directory, { withFileTypes: true });
  const source = await Promise.all(
    entries.map(async (entry) => {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) return readSourceTree(path);
      return /\.(?:ts|vue)$/u.test(entry.name) ? readFile(path, 'utf8') : '';
    }),
  );
  return source.join('\n');
}
