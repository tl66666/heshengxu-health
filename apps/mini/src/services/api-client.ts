import type { ApiFailure, ApiSuccess } from '../../../../packages/contracts/src/index.js';

type ApiResponse<T> = {
  statusCode: number;
  data: ApiSuccess<T> | ApiFailure;
};

type ApiTransport = <T>(request: {
  url: string;
  method: 'GET' | 'PUT';
  data?: unknown;
}) => Promise<ApiResponse<T>>;

export function createApiClient({ baseUrl, request }: { baseUrl: string; request: ApiTransport }) {
  return {
    async get<T>(path: string): Promise<T> {
      const response = await request<T>({ url: `${baseUrl}${path}`, method: 'GET' });
      if (response.statusCode >= 200 && response.statusCode < 300 && 'data' in response.data) {
        return response.data.data;
      }

      const failure = response.data as ApiFailure;
      throw new Error(
        `${failure.error.code} [${failure.error.requestId}]: ${failure.error.message}`,
      );
    },
    async update<T>(path: string, data: unknown): Promise<T> {
      const response = await request<T>({
        url: `${baseUrl}${path}`,
        method: 'PUT',
        data,
      });
      if (response.statusCode >= 200 && response.statusCode < 300 && 'data' in response.data) {
        return response.data.data;
      }

      const failure = response.data as ApiFailure;
      throw new Error(
        `${failure.error.code} [${failure.error.requestId}]: ${failure.error.message}`,
      );
    },
  };
}
