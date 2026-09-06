import { afterEach, describe, expect, it, vi } from 'vitest';
import { readImageBase64 } from './image-base64.js';

describe('readImageBase64', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reads base64 through the uni file manager on mini-program runtimes', async () => {
    vi.stubGlobal('uni', {
      getFileSystemManager: () => ({
        readFile: ({ success }: { success: (result: { data: string }) => void }) => success({ data: 'abc123' }),
      }),
    });

    await expect(readImageBase64('/tmp/food.jpg')).resolves.toBe('abc123');
  });

  it('falls back to plus.io when the uni file manager is unavailable', async () => {
    vi.stubGlobal('uni', {});
    vi.stubGlobal('FileReader', class {
      result = 'data:image/jpeg;base64,Zm9vZA==';
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      readAsDataURL() { this.onload?.(); }
    });
    vi.stubGlobal('plus', {
      io: {
        resolveLocalFileSystemURL: (_path: string, success: (entry: { file: (callback: (file: Blob) => void) => void }) => void) => {
          success({ file: (callback) => callback(new Blob(['food'])) });
        },
      },
    });

    await expect(readImageBase64('/tmp/food.jpg')).resolves.toBeTypeOf('string');
  });
});
