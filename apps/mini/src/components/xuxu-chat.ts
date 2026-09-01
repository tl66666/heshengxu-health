export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  sourceTitle?: string;
};

export const quickQuestions = [
  { id: 'sleep', label: '最近睡不好怎么办？' },
  { id: 'diet', label: '外卖怎么吃更健康？' },
  { id: 'activity', label: '久坐怎么缓解？' },
  { id: 'water', label: '今天喝水够不够？' },
] as const;

export type XuxuErrorKind = 'network' | 'auth' | 'service' | 'unknown';

export function classifyXuxuError(error: unknown): XuxuErrorKind {
  const message = error instanceof Error ? error.message : String(error);
  if (/NETWORK_TIMEOUT|NETWORK_ERROR|timeout|network/i.test(message)) return 'network';
  if (/UNAUTHORIZED|AUTH|401|login/i.test(message)) return 'auth';
  if (/SERVICE_UNAVAILABLE|503|provider|model/i.test(message)) return 'service';
  return 'unknown';
}

export function createUserMessage(text: string): ChatMessage {
  return { id: `user-${Date.now()}`, role: 'user', text: text.trim() };
}

export function createRuleReply(text: string) {
  if (/胸痛|胸闷|呼吸困难|诊断|吃什么药|是不是.*病/.test(text)) {
    return '我不能替代医生，也不能根据一句话判断疾病。如果症状持续、加重或伴随呼吸困难，请及时联系医生；紧急情况请拨打 120。';
  }
  if (/睡|失眠|熬夜/.test(text)) {
    return '先从规律开始：固定起床时间，睡前一小时减少屏幕刺激，连续记录几天再看自己的节律变化。';
  }
  if (/外卖|饮食|吃|喝水|饮水|热量/.test(text)) {
    return '可以先看一餐结构：优先保证蔬菜和蛋白质，再选择主食和烹饪方式。不用急着计算热量，先记录真实选择。';
  }
  if (/运动|久坐|活动|走路|锻炼/.test(text)) {
    return '久坐时每 50 分钟起身活动 3 分钟，今天先完成一次 15 分钟轻松步行就很好。出现疼痛或明显不适时请停止并咨询专业人士。';
  }
  return '我会结合你已经记录的信息，陪你把问题拆成一个今天能做的小行动。你可以问我睡眠、饮食、活动或记录。';
}

export function replySource(text: string) {
  if (/睡|失眠|熬夜/.test(text)) return '睡眠与精力指南';
  if (/外卖|饮食|吃|喝水|饮水|热量/.test(text)) return '日常饮食结构';
  if (/运动|久坐|活动|走路|锻炼/.test(text)) return '轻量活动建议';
  return undefined;
}
