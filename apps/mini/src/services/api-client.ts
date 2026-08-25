import type { ApiFailure, ApiSuccess } from '../../../../packages/contracts/src/index.js';

type ApiResponse<T> = {
  statusCode: number;
  data: ApiSuccess<T> | ApiFailure;
};

type ApiTransport = <T>(request: {
  url: string;
  method: 'GET' | 'PUT' | 'POST' | 'PATCH';
  data?: unknown;
}) => Promise<ApiResponse<T>>;

export function createApiClient({ baseUrl, request }: { baseUrl: string; request: ApiTransport }) {
  async function send<T>(
    method: 'GET' | 'PUT' | 'POST' | 'PATCH',
    path: string,
    data?: unknown,
  ): Promise<T> {
    const response = await request<T>({ url: `${baseUrl}${path}`, method, data });
    if (response.statusCode >= 200 && response.statusCode < 300 && 'data' in response.data) {
      return response.data.data;
    }

    const failure = response.data as ApiFailure;
    throw new Error(`${failure.error.code} [${failure.error.requestId}]: ${failure.error.message}`);
  }

  return {
    async get<T>(path: string): Promise<T> {
      return send<T>('GET', path);
    },
    async update<T>(path: string, data: unknown): Promise<T> {
      return send<T>('PUT', path, data);
    },
    async post<T>(path: string, data: unknown): Promise<T> {
      return send<T>('POST', path, data);
    },
    async patch<T>(path: string, data: unknown): Promise<T> {
      return send<T>('PATCH', path, data);
    },
  };
}
