import type {
  DailyHomeDto,
  PlanTaskAction,
} from '../../../../../packages/contracts/src/health-loop.js';

const taskCopy: Record<PlanTaskAction, { title: string; subtitle: string }> = {
  record_weight: { title: '记录今天体重', subtitle: '一次记录就够了' },
  record_meal: { title: '记录一餐的结构', subtitle: '看看主食、蛋白质和蔬菜' },
  walk_15_minutes: { title: '步行 15 分钟', subtitle: '给身体一点活动空间' },
  record_sleep: { title: '补记昨晚睡眠', subtitle: '帮助理解今天的精力' },
};

export function deriveDailyExperience(today: DailyHomeDto) {
  const tasks = today.todayTasks
    .filter((task) => task.status === 'pending')
    .slice(0, 3)
    .map((task) => ({
      id: task.id,
      actionType: task.actionType,
      ...taskCopy[task.actionType],
      route: routeFor(task.actionType),
    }));
  const complete = today.recordingProgress.completed === today.recordingProgress.total;

  return {
    hero: {
      eyebrow: '今日陪伴',
      title: today.dailyAction.title,
      description: today.dailyAction.description,
      route: today.dailyAction.route,
    },
    tasks,
    recording: {
      completed: today.recordingProgress.completed,
      total: today.recordingProgress.total,
      message: complete
        ? '今天的记录已经齐了，慢慢保持这个节律。'
        : '从一件最容易的小事开始，序序会陪你慢慢补齐。',
      image: complete ? 'complete' : 'reminder',
    },
  };
}

function routeFor(action: PlanTaskAction) {
  const recordType = {
    record_weight: 'weight',
    record_meal: 'meal-structure',
    walk_15_minutes: 'activity',
    record_sleep: 'sleep',
  }[action];

  return `/pages/records/RecordsPage?type=${recordType}`;
}
