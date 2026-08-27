import type { ApiFailure, ApiSuccess } from '../../../../packages/contracts/src/index.js';
import { resolveMiniRuntime, type MiniRuntime } from '../config/runtime.js';
import { createApiClient } from './api-client.js';

type ApiMethod = 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE';

type MiniRequestAdapter = <T>(request: {
  url: string;
  method: ApiMethod;
  data?: unknown;
  header: Record<string, string>;
}) => Promise<{ statusCode: number; data: ApiSuccess<T> | ApiFailure }>;

export function createMiniApiClient(
  runtime: MiniRuntime = resolveMiniRuntime(
    (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {},
  ),
  request: MiniRequestAdapter = requestWithUni,
) {
  const header: Record<string, string> = {};
  if (runtime.authorization) header.Authorization = runtime.authorization;
  return createApiClient({
    baseUrl: runtime.apiBaseUrl,
    request: ({ url, method, data }) => request({ url, method, data, header }),
  });
}

function requestWithUni<T>({
  url,
  method,
  data,
  header,
}: {
  url: string;
  method: ApiMethod;
  data?: unknown;
  header: Record<string, string>;
}): Promise<{ statusCode: number; data: ApiSuccess<T> | ApiFailure }> {
  return new Promise((resolve, reject) => {
    uni.request({
      url,
      method: method as never,
      data: data as Record<string, unknown>,
      header,
      success: (response) =>
        resolve({
          statusCode: response.statusCode,
          data: response.data as ApiSuccess<T> | ApiFailure,
        }),
      fail: reject,
    });
  });
}
