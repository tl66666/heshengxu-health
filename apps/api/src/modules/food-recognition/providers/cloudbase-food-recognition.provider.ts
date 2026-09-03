import { Injectable } from '@nestjs/common';
import { CloudBaseAiClient, CloudBaseAiError } from '../../ai/cloudbase-ai.client.js';
import type { FoodRecognitionProvider, RecognitionProviderCandidate } from './food-recognition.provider.js';

const PROMPT = `你是食物图片识别助手。只识别图片中清晰可见的食物，不猜测看不清的内容。请严格返回 JSON，不要 Markdown，不要解释：
{"candidates":[{"name":"食物名称","confidence":0.0,"estimatedGrams":100,"estimatedEnergyKcal":0,"estimatedProteinG":0,"estimatedFatG":0,"estimatedCarbohydrateG":0}]}
最多返回 5 个候选。confidence 必须是 0 到 1；克重和营养是按图片中可见份量的估算值，不是精确检测。若不是食物、图片模糊或无法判断，返回 {"candidates":[]}。`;

@Injectable()
export class CloudBaseFoodRecognitionProvider implements FoodRecognitionProvider {
  readonly provider = 'cloudbase';
  readonly model: string;
  private readonly client: CloudBaseAiClient;

  constructor() {
    this.client = new CloudBaseAiClient();
    this.model = this.client.visionModel;
  }

  async recognize(input: { imageKey: string; imageBase64?: string; contentType?: string }) {
    void input.imageKey;
    if (!input.imageBase64 || !input.contentType) {
      throw new CloudBaseAiError('图片数据缺失', 400, 'IMAGE_DATA_REQUIRED');
    }
    const text = await this.client.analyzeImage({
      dataUrl: `data:${input.contentType};base64,${input.imageBase64.replace(/^data:[^,]+,/u, '')}`,
      prompt: PROMPT,
    });
    return parseCandidates(text);
  }
}

function parseCandidates(text: string): RecognitionProviderCandidate[] {
  const normalized = text.trim().replace(/^```(?:json)?\s*/iu, '').replace(/\s*```$/u, '');
  let parsed: unknown;
  try {
    parsed = JSON.parse(normalized);
  } catch {
    throw new CloudBaseAiError('视觉模型返回格式无法解析', 502, 'INVALID_VISION_JSON');
  }
  const raw = (parsed as { candidates?: unknown })?.candidates;
  if (!Array.isArray(raw)) return [];
  return raw
    .slice(0, 5)
    .map((item) => normalizeCandidate(item))
    .filter((item): item is RecognitionProviderCandidate => item !== null);
}

function normalizeCandidate(value: unknown): RecognitionProviderCandidate | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Record<string, unknown>;
  const name = typeof item.name === 'string' ? item.name.trim() : '';
  const confidence = numberInRange(item.confidence, 0, 1);
  const estimatedGrams = numberInRange(item.estimatedGrams, 1, 5000);
  if (!name || confidence === null || estimatedGrams === null) return null;
  return {
    name,
    confidence,
    estimatedGrams,
    estimatedEnergyKcal: optionalNumber(item.estimatedEnergyKcal, 0, 5000),
    estimatedProteinG: optionalNumber(item.estimatedProteinG, 0, 500),
    estimatedFatG: optionalNumber(item.estimatedFatG, 0, 500),
    estimatedCarbohydrateG: optionalNumber(item.estimatedCarbohydrateG, 0, 1000),
  };
}

function numberInRange(value: unknown, min: number, max: number) {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) && number >= min && number <= max ? number : null;
}

function optionalNumber(value: unknown, min: number, max: number) {
  return numberInRange(value, min, max) ?? undefined;
}
