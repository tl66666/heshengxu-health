export type ApiSuccess<T> = {
  data: T;
  meta?: { requestId: string };
};

export type ApiFailure = {
  error: { code: string; message: string; requestId: string };
};
