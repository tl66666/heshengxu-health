import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { RecognitionImageStorage } from './recognition-image-storage.js';

@Injectable()
export class MockRecognitionImageStorage implements RecognitionImageStorage {
  createObjectKey({ userId, contentType }: { userId: string; contentType: string }) {
    const extension =
      contentType === 'image/png' ? 'png' : contentType === 'image/webp' ? 'webp' : 'jpg';
    return `mock/food-recognition/${userId}/${randomUUID()}.${extension}`;
  }
}
