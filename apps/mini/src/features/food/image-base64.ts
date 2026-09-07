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
    let settled = false;
    const timeoutId = setTimeout(
      () => finish(() => reject(new Error('IMAGE_READ_TIMEOUT'))),
      15_000,
    );
    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      try {
        callback();
      } catch (error) {
        reject(error);
      }
    };
    const plusRuntime = getPlusRuntime();
    const platform = getUniPlatform();
    const isAppPlus =
      platform === 'app' ||
      platform === 'app-plus' ||
      Boolean(plusRuntime?.io?.resolveLocalFileSystemURL);
    const readFromPlus = () =>
      readWithPlus(
        path,
        plusRuntime,
        (result) => finish(() => resolve(result)),
        (error) => finish(() => reject(error)),
      );

    // App-plus exposes a getFileSystemManager compatibility shim on some
    // versions, but its readFile callback can remain pending for camera paths.
    // Always use the native plus.io reader first on App.
    if (isAppPlus) {
      readFromPlus();
      return;
    }

    const fileSystem = (typeof uni !== 'undefined' ? uni.getFileSystemManager?.() : undefined) as
      | {
          readFile?: (options: {
            filePath: string;
            encoding: 'base64';
            success?: (result: { data: unknown }) => void;
            fail?: (error: unknown) => void;
          }) => void;
        }
      | undefined;

    if (fileSystem?.readFile) {
      fileSystem.readFile({
        filePath: path,
        encoding: 'base64',
        success: ({ data }) => {
          const value = String(data ?? '');
          if (value) finish(() => resolve(value));
          else readFromPlus();
        },
        fail: () => readFromPlus(),
      });
      return;
    }

    readFromPlus();
  });
}

type PlusFileEntry = {
  file: (success: (file: Blob) => void, fail?: (error: unknown) => void) => void;
};

type PlusRuntime = {
  io?: {
    FileReader?: new () => {
      result?: unknown;
      onload?: (() => void) | null;
      onerror?: (() => void) | null;
      readAsDataURL: (file: Blob) => void;
    };
    resolveLocalFileSystemURL?: (
      url: string,
      success: (entry: PlusFileEntry) => void,
      fail?: (error: unknown) => void,
    ) => void;
  };
};

function getPlusRuntime(): PlusRuntime | undefined {
  return (
    globalThis as {
      plus?: {
        io?: {
          FileReader?: new () => {
            result?: unknown;
            onload?: (() => void) | null;
            onerror?: (() => void) | null;
            readAsDataURL: (file: Blob) => void;
          };
          resolveLocalFileSystemURL?: (
            url: string,
            success: (entry: PlusFileEntry) => void,
            fail?: (error: unknown) => void,
          ) => void;
        };
      };
    }
  ).plus;
}

function getUniPlatform(): string | undefined {
  try {
    const value = (
      uni as unknown as { getSystemInfoSync?: () => { uniPlatform?: string } }
    ).getSystemInfoSync?.().uniPlatform;
    return typeof value === 'string' ? value : undefined;
  } catch {
    return undefined;
  }
}

function readWithPlus(
  path: string,
  plusRuntime: PlusRuntime | undefined,
  resolve: (value: string) => void,
  reject: (reason?: unknown) => void,
) {
  const resolveUrl = plusRuntime?.io?.resolveLocalFileSystemURL;
  if (!resolveUrl) {
    reject(new Error('IMAGE_READ_UNSUPPORTED'));
    return;
  }

  try {
    resolveUrl(
      path,
      (entry) => {
        try {
          entry.file((file) => {
            try {
              const Reader =
                plusRuntime?.io?.FileReader ??
                (
                  globalThis as {
                    FileReader?: new () => {
                      result?: unknown;
                      onload?: (() => void) | null;
                      onerror?: (() => void) | null;
                      readAsDataURL: (file: Blob) => void;
                    };
                  }
                ).FileReader;
              if (!Reader) {
                reject(new Error('IMAGE_READ_UNSUPPORTED'));
                return;
              }
              const reader = new Reader();
              reader.onload = () => {
                const value = String(reader.result ?? '');
                const comma = value.indexOf(',');
                const base64 = comma >= 0 ? value.slice(comma + 1) : value;
                if (base64) resolve(base64);
                else reject(new Error('IMAGE_READ_EMPTY'));
              };
              reader.onerror = () => reject(new Error('IMAGE_READ_FAILED'));
              reader.readAsDataURL(file);
            } catch (error) {
              reject(error);
            }
          }, reject);
        } catch (error) {
          reject(error);
        }
      },
      reject,
    );
  } catch (error) {
    reject(error);
  }
}
