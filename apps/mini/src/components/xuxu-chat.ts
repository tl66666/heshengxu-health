export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  sourceTitle?: string;
};

export const quickQuestions = [
  { id: 'sleep', label: '最近睡不好，怎么调整？' },
  { id: 'diet', label: '外卖怎么吃得更均衡？' },
  { id: 'activity', label: '久坐时怎么活动一下？' },
  { id: 'water', label: '今天喝水够不够？' },
] as const;

export type XuxuErrorKind = 'network' | 'auth' | 'service' | 'unknown';

export function classifyXuxuError(error: unknown): XuxuErrorKind {
  const message = error instanceof Error ? error.message : String(error);
  if (/NETWORK_TIMEOUT|NETWORK_ERROR|Failed to fetch|Network request failed|timeout|network/i.test(message)) return 'network';
  if (/UNAUTHORIZED|AUTH|401|login/i.test(message)) return 'auth';
  if (/SERVICE_UNAVAILABLE|INTERNAL_ERROR|503|500|provider|model|CloudBase/i.test(message)) return 'service';
  return 'unknown';
}

export function createUserMessage(text: string): ChatMessage {
  return { id: `user-${Date.now()}-${Math.random().toString(16).slice(2)}`, role: 'user', text: text.trim() };
}

export function createOfflineReply(text: string): ChatMessage {
  const normalized = text.toLowerCase();
  if (/胸痛|胸闷|呼吸困难|诊断|吃什么药|是不是.*病|症状/.test(normalized)) {
    return { id: `assistant-offline-${Date.now()}`, role: 'assistant', text: '我不能替代医生，也不能根据一句话判断疾病。若胸痛、呼吸困难或不适持续、加重，请尽快联系专业医生；出现紧急情况请拨打 120。' };
  }
  let reply = '我先陪你把事情拆小一点。你可以告诉我今天最想改善的是睡眠、饮食、喝水还是活动，我会给你一个现在就能做的小建议。';
  let sourceTitle: string | undefined;
  if (/睡|失眠|入睡|梦/.test(normalized)) {
    reply = '今晚先给自己留出 30 分钟缓冲：睡前把灯光调暗，放下手机，固定一个容易坚持的上床时间。明早醒来后再记录昨晚的入睡和起床时间，连续记 3 天会更容易看出规律。';
    sourceTitle = '睡眠与精力小指南';
  } else if (/外卖|吃|饮食|早餐|午餐|晚餐|热量/.test(normalized)) {
    reply = '点外卖时可以先选一份蔬菜，再搭配蛋白质和主食：比如青菜 + 鸡蛋/鱼/鸡肉 + 半份米饭。先记录真实吃下的内容，不需要一开始就追求精确。';
    sourceTitle = '日常饮食结构';
  } else if (/喝水|水量|饮水/.test(normalized)) {
    reply = '把今天的目标分成几次完成会更轻松：起床后、午餐前后、下午和晚餐后各喝一杯。打开喝水记录页就能修改每杯容量，序序会按你的真实记录更新进度。';
    sourceTitle = '日常饮水建议';
  } else if (/久坐|运动|活动|走路|锻炼/.test(normalized)) {
    reply = '每坐 50 分钟就站起来 3 分钟，走几步、伸展肩颈都可以。今天先完成一次 10 分钟轻松散步，身体有疼痛或明显不适时请先停下来。';
    sourceTitle = '轻量活动建议';
  }
  return { id: `assistant-offline-${Date.now()}`, role: 'assistant', text: reply, sourceTitle };
}

/** Kept for the existing unit tests and callers that only need reply text. */
export function createRuleReply(text: string) {
  return createOfflineReply(text).text;
}

export function replySource(text: string) {
  if (/睡|失眠|入睡|梦/.test(text)) return '睡眠与精力小指南';
  if (/外卖|吃|饮食|早餐|午餐|晚餐|热量/.test(text)) return '日常饮食结构';
  if (/喝水|饮水/.test(text)) return '日常饮水建议';
  if (/运动|久坐|活动|走路|锻炼/.test(text)) return '轻量活动建议';
  return undefined;
}
