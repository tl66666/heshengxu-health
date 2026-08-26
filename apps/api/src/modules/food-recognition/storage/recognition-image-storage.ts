export type RecognitionImageUploadRequest = { userId: string; contentType: string };

export interface RecognitionImageStorage {
  createObjectKey(input: RecognitionImageUploadRequest): string;
}
