import { createHash } from 'node:crypto';

export type AiTrace = {
  userId: string;
  requestHash: string;
  safetyDecision: 'allow' | 'block';
  safetyReason?: string;
  provider?: string;
  model?: string;
};

export interface AiTraceRepository {
  save(trace: AiTrace): Promise<void>;
}

export class AiAuditService {
  constructor(private readonly repository: AiTraceRepository) {}

  record(input: {
    userId: string;
    message: string;
    safetyDecision: 'allow' | 'block';
    safetyReason?: string;
    provider?: string;
    model?: string;
  }) {
    return this.repository.save({
      userId: input.userId,
      requestHash: createHash('sha256').update(input.message).digest('hex'),
      safetyDecision: input.safetyDecision,
      safetyReason: input.safetyReason,
      provider: input.provider,
      model: input.model,
    });
  }
}
