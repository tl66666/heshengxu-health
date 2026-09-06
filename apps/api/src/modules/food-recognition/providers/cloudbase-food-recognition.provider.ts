import { Injectable } from '@nestjs/common';
import { CloudBaseAiClient, CloudBaseAiError } from '../../ai/cloudbase-ai.client.js';
import type { FoodRecognitionProvider, RecognitionProviderCandidate } from './food-recognition.provider.js';

const PROMPT = `你是一名熟悉中式家常菜、外卖套餐和常见餐饮的营养识别助手。
先判断整份菜或套餐的真实名称，例如“猪脚饭”“番茄鸡蛋面”“麻辣烫”，不要因为数据库可能没有这个名字而改成蛋糕、米饭等无关单品。
再拆解图片里清晰可见的主要组成，并结合常见餐具估算可食部分克重和营养。营养均指照片中整份可见份量，不是每 100 克。
严格返回 JSON，不要 Markdown，不要额外解释：
{"candidates":[{"name":"整份菜品名称","confidence":0.0,"estimatedGrams":100,"estimatedEnergyKcal":0,"estimatedProteinG":0,"estimatedFatG":0,"estimatedCarbohydrateG":0,"components":[{"name":"组成食物","estimatedGrams":50,"estimatedEnergyKcal":80}],"uncertaintyNote":"影响估算的主要不确定因素"}]}
第一项必须是你认为最可能的整份菜名，最多给 3 个真正合理的备选；不要把组成食材作为同级候选。confidence 为 0 到 1。components 最多 8 项，克重总和应接近整份克重，热量总和应接近整份热量。看不清的酱汁或油量可以在 uncertaintyNote 说明，不要编造品牌。若不是食物、图片过于模糊或无法判断，返回 {"candidates":[]}。`;

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

export function parseCandidates(text: string): RecognitionProviderCandidate[] {
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
    components: normalizeComponents(item.components),
    uncertaintyNote: typeof item.uncertaintyNote === 'string'
      ? item.uncertaintyNote.trim().slice(0, 180) || undefined
      : undefined,
  };
}

function normalizeComponents(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 8).map((component) => {
    if (!component || typeof component !== 'object') return null;
    const item = component as Record<string, unknown>;
    const name = typeof item.name === 'string' ? item.name.trim() : '';
    const estimatedGrams = numberInRange(item.estimatedGrams, 1, 5000);
    const estimatedEnergyKcal = numberInRange(item.estimatedEnergyKcal, 0, 5000);
    if (!name || estimatedGrams === null || estimatedEnergyKcal === null) return null;
    return { name: name.slice(0, 60), estimatedGrams, estimatedEnergyKcal };
  }).filter((item): item is { name: string; estimatedGrams: number; estimatedEnergyKcal: number } => item !== null);
}

function numberInRange(value: unknown, min: number, max: number) {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) && number >= min && number <= max ? number : null;
}

function optionalNumber(value: unknown, min: number, max: number) {
  return numberInRange(value, min, max) ?? undefined;
}
