type WeightInput = {
  current?: number | null;
  start?: number | null;
  target?: number | null;
  direction?: string | null;
};
const positive = (value: number | undefined): value is number =>
  Number.isFinite(value) && Number(value) > 0;

export function weightOverview(input: WeightInput) {
  const current = Number(input.current);
  const start = Number(input.start);
  const target = Number(input.target);
  const hasCurrent = positive(current);
  const hasTarget = positive(target);
  const tracksChange =
    hasTarget && positive(start) && start !== target && input.direction !== 'maintain';
  if (!tracksChange)
    return {
      hasTarget,
      progress: 0,
      showNode: false,
      value: hasCurrent ? current.toFixed(1) : '--',
      label: '当前体重 · kg',
      caption: hasCurrent
        ? hasTarget
          ? '记录日常波动，观察长期趋势'
          : '先积累真实记录，再按需设置目标'
        : '记录第一条，开始看见变化',
    };
  if (!hasCurrent)
    return {
      hasTarget,
      progress: 0,
      showNode: false,
      value: '--',
      label: input.direction === 'gain' ? '已增加 · kg' : '已减去 · kg',
      caption: '等待一次真实体重记录',
    };
  const amount = Math.max(0, input.direction === 'gain' ? current - start : start - current);
  const gap = Math.abs(current - target);
  return {
    hasTarget,
    progress: Math.min(100, (amount / Math.abs(target - start)) * 100),
    showNode: true,
    value: amount.toFixed(1),
    label: input.direction === 'gain' ? '已增加 · kg' : '已减去 · kg',
    caption: gap < 0.05 ? '已到达目标附近' : `距离目标 ${gap.toFixed(1)} kg`,
  };
}
