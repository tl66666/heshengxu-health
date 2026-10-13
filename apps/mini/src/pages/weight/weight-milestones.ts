type Evidence = { start: number; current: number; direction: string; hasGoal: boolean };
export function weightChangeMilestone({ start, current, direction, hasGoal }: Evidence) {
  const valid = Number.isFinite(start) && Number.isFinite(current) && start > 0 && current > 0;
  const goal = hasGoal && (direction === 'gain' || direction === 'lose');
  const title = !goal ? '记录变化' : direction === 'gain' ? '稳步增加 1kg' : '轻盈 1kg';
  if (!valid) return { title, note: '待记录', achieved: false };
  const delta = current - start;
  if (!goal)
    return { title, note: `较初始 ${delta > 0 ? '+' : ''}${delta.toFixed(1)} kg`, achieved: false };
  const change = direction === 'gain' ? delta : -delta;
  return { title, note: change >= 1 ? '已达成' : '按目标方向观察', achieved: change >= 1 };
}
