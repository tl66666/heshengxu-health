/**
 * Read a local image as raw base64 on both uni-app targets.
 *
 * WeChat exposes getFileSystemManager().readFile, while some App-plus
 * runtimes return a temporary camera path that is only readable through
 * plus.io. Keeping the fallback here prevents the recognition page from
 * converting a successful camera capture into a generic network error.
 */
export function readImageBase64(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileSystem = (typeof uni !== 'undefined' ? uni.getFileSystemManager?.() : undefined) as
      | { readFile?: (options: { filePath: string; encoding: 'base64'; success?: (result: { data: unknown }) => void; fail?: (error: unknown) => void }) => void }
      | undefined;

    if (fileSystem?.readFile) {
      fileSystem.readFile({
        filePath: path,
        encoding: 'base64',
        success: ({ data }) => {
          const value = String(data ?? '');
          if (value) resolve(value);
          else readWithPlus(path, resolve, reject);
        },
        fail: () => readWithPlus(path, resolve, reject),
      });
      return;
    }

    readWithPlus(path, resolve, reject);
  });
}

type PlusFileEntry = {
  file: (success: (file: Blob) => void, fail?: (error: unknown) => void) => void;
};

function readWithPlus(path: string, resolve: (value: string) => void, reject: (reason?: unknown) => void) {
  const plusRuntime = (globalThis as {
    plus?: {
      io?: {
        resolveLocalFileSystemURL?: (
          url: string,
          success: (entry: PlusFileEntry) => void,
          fail?: (error: unknown) => void,
        ) => void;
      };
    };
  }).plus;
  const resolveUrl = plusRuntime?.io?.resolveLocalFileSystemURL;
  if (!resolveUrl) {
    reject(new Error('IMAGE_READ_UNSUPPORTED'));
    return;
  }

  resolveUrl(path, (entry) => {
    entry.file((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const value = String(reader.result ?? '');
        const comma = value.indexOf(',');
        const base64 = comma >= 0 ? value.slice(comma + 1) : value;
        base64 ? resolve(base64) : reject(new Error('IMAGE_READ_EMPTY'));
      };
      reader.onerror = () => reject(new Error('IMAGE_READ_FAILED'));
      reader.readAsDataURL(file);
    }, reject);
  }, reject);
}
