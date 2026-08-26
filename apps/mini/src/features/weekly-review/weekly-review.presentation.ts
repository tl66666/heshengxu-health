export type WeeklyReviewSummary = {
  coverage: {
    recordedDayCount: number;
    requiredDayCount: number;
    status: 'insufficient' | 'ready';
  };
};

export function weeklyReviewEntry(review: WeeklyReviewSummary) {
  if (review.coverage.status === 'insufficient') {
    const remaining = Math.max(
      0,
      review.coverage.requiredDayCount - review.coverage.recordedDayCount,
    );
    return {
      title: '本周还在收集节律',
      caption: `再记录 ${remaining} 天，就能形成一份基于真实记录的回顾。`,
      action: '去记录',
    };
  }
  return {
    title: '本周回顾已准备好',
    caption: `已覆盖 ${review.coverage.recordedDayCount} 天真实记录。`,
    action: '查看回顾',
  };
}
