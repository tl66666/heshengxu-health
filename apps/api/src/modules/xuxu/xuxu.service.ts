import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { AiAuditService } from '../ai/ai-audit.service.js';
import { CloudBaseAiClient, CloudBaseAiError } from '../ai/cloudbase-ai.client.js';
import type { XuxuChatDto } from './xuxu.dto.js';

const SYSTEM_PROMPT =
  '你是序序，一个温柔、清晰、克制的健康陪伴助手。只提供生活方式和健康管理参考，不进行疾病诊断，不替代医生，也不指导处方药用量。请使用简体中文，先给出一到两个马上能执行的小步骤，再补充原因。遇到胸痛、呼吸困难、意识异常、严重过敏、持续高热或自伤风险，明确建议尽快联系急救或专业医生。不要编造用户没有记录过的健康数据。';

@Injectable()
export class XuxuService {
  private readonly client = new CloudBaseAiClient();

  constructor(private readonly audit: AiAuditService) {}

  async chat(userId: string, dto: XuxuChatDto) {
    const messages = dto.messages
      .filter((item) => item.content.trim())
      .slice(-12)
      .map((item) => ({ role: item.role, content: item.content.trim() as string }));
    if (!messages.length) throw new ServiceUnavailableException('请输入想和序序聊的问题');
    await this.audit.record({
      userId,
      message: messages.map((item) => item.content).join('\n'),
      safetyDecision: 'allow',
      provider: 'cloudbase',
      model: this.client.textModel,
    });
    try {
      const content = await this.client.generateText([{ role: 'system', content: SYSTEM_PROMPT }, ...messages]);
      return { message: { role: 'assistant' as const, content }, model: this.client.textModel };
    } catch (error) {
      if (error instanceof CloudBaseAiError && error.status && error.status < 500) {
        throw new ServiceUnavailableException('序序暂时无法回复，请检查 CloudBase AI 配置或额度');
      }
      throw new ServiceUnavailableException('序序暂时没有回复成功，请稍后重试');
    }
  }
}
