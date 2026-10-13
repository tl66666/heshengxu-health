import { findGuides } from './content.js';
import type { Guide, TopicId } from './types.js';
import { bibleChapters } from '../lean-muscle/bible.js';

const originalSteps: Record<string, string[]> = {
  'muscle-foundation': [
    '确认自己的方向与当前限制',
    '选择可用场地、训练日与熟悉动作',
    '保存个人安排并确认生效时间',
  ],
  'muscle-progress': [
    '选择可比较的动作变式与负重口径',
    '保存实际正式组的次数和重量',
    '回看同一条件下的变化并留下观察',
  ],
  'muscle-guide': ['根据当前问题选一章', '读原则、误区与来源', '选择一个适用行动，记录实际结果'],
  'sun-map': [
    '为一个选择分别写事实和假设',
    '列出尚缺的证据与获取方式',
    '确定一项投入有限的核对步骤',
  ],
  'sun-data': [
    '写下目标、限制和已经做过的事',
    '记录实际结果，分开事实与猜测',
    '删去无关敏感资料，留下下一条问题',
  ],
  'sun-experiment': [
    '选一个能低成本尝试的想法',
    '写明时间范围、观察方式与停止条件',
    '尝试后记录结果并决定是否继续',
  ],
  'water-meaning': [
    '确认常用容器容量与个人目标',
    '选择真实饮品与实际饮水量',
    '保存一次真实记录，回看是否方便坚持',
  ],
  'water-drink': [
    '选一种最常喝的饮品核对标签',
    '找到自己愿意接受的替换选择',
    '记录实际饮品与份量，再看是否可持续',
  ],
  'water-goal': [
    '核对个人限制与日常活动情况',
    '检查杯子容量和当前目标口径',
    '按适用情况调整目标，不追求更大量',
  ],
  'codex-start': [
    '选定一个能够直接检查的小成果',
    '给出项目背景与必须保留的约束',
    '明确验收方式，回看实际修改和验证',
  ],
  'codex-prompt': [
    '填写具体目标与相关上下文',
    '写清限制、输入和预期输出',
    '给出验证方法，修改后再使用模板',
  ],
  'codex-check': [
    '将改动与原需求逐项对应',
    '查看实际检查结果和未验证部分',
    '核对无关改动与资料范围，记录剩余问题',
  ],
  'life-focus': [
    '选择一个有明确结果的任务',
    '减少一项非必要打断并保留必要联系',
    '记录实际完成情况与仍存在的障碍',
  ],
  'life-time': [
    '记录一段真实时间去向',
    '找出一项可减少的重复或等待',
    '尝试调整并检查是否帮助实际任务',
  ],
  'life-learn': ['为技能确定真实使用场景', '选择一个可展示的小成果', '实际练习后记录缺口与下一步'],
  'life-security': [
    '选择一个重要账号，从官方入口查看',
    '核对恢复方式和陌生登录情况',
    '在可信位置确认保护与找回方式，不记录秘密',
  ],
};
export function actionStepsFor(guide: Guide): string[] {
  return guide.actionSteps || originalSteps[guide.id] || [guide.action];
}
export function readingPathFor(topic: TopicId) {
  return findGuides({ topic });
}
export function chapterPosition(guide: Guide) {
  const path = readingPathFor(guide.topic);
  const index = path.findIndex((g) => g.id === guide.id);
  return {
    number: index + 1,
    total: path.length,
    previous: path[index - 1] || null,
    next: path[index + 1] || null,
  };
}
export function readingMinutes(guide: Guide) {
  const length = guide.sections.reduce(
    (total, section) => total + section.paragraphs.join('').length,
    0,
  );
  return Math.max(1, Math.ceil(length / 360));
}
export function bookProgress(
  topic: TopicId,
  state: { completedGuideIds: readonly string[]; completedBibleIds: readonly string[] },
) {
  const ids =
    topic === 'muscle' ? bibleChapters.map((c) => c.id) : readingPathFor(topic).map((g) => g.id);
  const completed = topic === 'muscle' ? state.completedBibleIds : state.completedGuideIds;
  const count = ids.filter((id) => completed.includes(id)).length;
  return {
    count,
    total: ids.length,
    percent: ids.length ? Math.round((count / ids.length) * 100) : 0,
  };
}
