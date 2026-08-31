import type { HabitPlan, PlanCategory, PlanTemplate } from './plan-types.js';

const GUEST_STORAGE_KEY = 'heban.local.habit-plans.guest.v1';
const USER_STORAGE_PREFIX = 'heban.local.habit-plans.user.';
const USER_ID_KEY = 'heban.auth.user-id';

export const PLAN_TEMPLATES: PlanTemplate[] = [
  {
    title: '温和体重管理',
    subtitle: '用稳定的小动作，照顾身体的节奏',
    category: 'weight',
    icon: '/static/illustrations/program-weight.png',
    tint: '#e4f0e7',
    frequency: '每天 3 个小行动',
    tasks: [
      { title: '记录今天的体重', note: '起床后、早餐前记录更容易坚持' },
      { title: '三餐都有蔬菜', note: '给餐盘留一半清爽的绿色' },
      { title: '散步 15 分钟', note: '饭后走一小圈也算完成' },
    ],
  },
  {
    title: '好好吃饭',
    subtitle: '把每一餐都变成温柔的自我照顾',
    category: 'food',
    icon: '/static/illustrations/program-digestive.png',
    tint: '#f8ead3',
    frequency: '每天 2 个小行动',
    tasks: [
      { title: '完成一顿均衡早餐', note: '主食 + 蛋白质 + 一点水果' },
      { title: '慢慢吃完一顿饭', note: '放下手机，给自己 20 分钟' },
    ],
  },
  {
    title: '今天不喝奶茶',
    subtitle: '把甜味换成更轻盈的满足',
    category: 'drink',
    icon: '/static/icons/watercolor/water-drop.png',
    tint: '#e2eef2',
    frequency: '每天 1 个小行动',
    tasks: [{ title: '用水或无糖茶替代奶茶', note: '想喝的时候先喝一杯温水' }],
  },
  {
    title: '专注学习',
    subtitle: '每天留一段只属于自己的安静时间',
    category: 'study',
    icon: '/static/illustrations/xuxu-record-reminder.png',
    tint: '#eee8f3',
    frequency: '每天 1 个小行动',
    tasks: [{ title: '专注学习 25 分钟', note: '完成后休息 5 分钟，再决定要不要继续' }],
  },
  {
    title: '轻轻运动',
    subtitle: '让身体舒展开，心情也会松一点',
    category: 'exercise',
    icon: '/static/illustrations/program-metabolic.png',
    tint: '#f3e5dd',
    frequency: '每周 5 天',
    tasks: [{ title: '运动 20 分钟', note: '拉伸、瑜伽或快走都可以' }],
  },
  {
    title: '早一点睡',
    subtitle: '给明天的自己留一盏小灯',
    category: 'sleep',
    icon: '/static/illustrations/program-sleep.png',
    tint: '#e8e7f3',
    frequency: '每天 1 个小行动',
    tasks: [{ title: '在 23:30 前放下手机', note: '洗漱后做三次慢呼吸' }],
  },
  {
    title: '记录心情',
    subtitle: '每天问问自己：今天还好吗？',
    category: 'mood',
    icon: '/static/illustrations/program-mood.png',
    tint: '#f7e3e8',
    frequency: '每天 1 个小行动',
    tasks: [{ title: '写下一句今天的心情', note: '不用完整，想到什么写什么' }],
  },
];

function today() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function read(): HabitPlan[] {
  const raw = uni.getStorageSync(storageKey());
  if (!raw) return [];
  try {
    const value = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function write(plans: HabitPlan[]) {
  uni.setStorageSync(storageKey(), plans);
  return plans;
}

function storageKey() {
  const userId = uni.getStorageSync(USER_ID_KEY);
  return typeof userId === 'string' && userId
    ? `${USER_STORAGE_PREFIX}${userId}`
    : GUEST_STORAGE_KEY;
}

export function migrateGuestPlansToUser(userId: string) {
  if (!userId.trim()) return [];
  const guest = uni.getStorageSync(GUEST_STORAGE_KEY);
  const guestPlans = Array.isArray(guest) ? (guest as HabitPlan[]) : [];
  const userKey = `${USER_STORAGE_PREFIX}${userId}`;
  const current = uni.getStorageSync(userKey);
  const userPlans = Array.isArray(current) ? (current as HabitPlan[]) : [];
  const merged = [...userPlans];
  for (const plan of guestPlans) {
    if (!merged.some((item) => item.title === plan.title)) merged.push(plan);
  }
  uni.setStorageSync(userKey, merged);
  uni.removeStorageSync(GUEST_STORAGE_KEY);
  return merged;
}

function hydrate(template: PlanTemplate, id = `habit-${Date.now()}`): HabitPlan {
  return {
    ...template,
    id,
    createdAt: new Date().toISOString(),
    tasks: template.tasks.map((task, index) => ({
      ...task,
      id: `${id}-task-${index}`,
      doneDates: [],
    })),
  };
}

export function loadHabitPlans() {
  return read();
}

export function addTemplatePlan(template: PlanTemplate) {
  const plans = read();
  const existing = plans.find((plan) => plan.title === template.title);
  if (existing) return { plans, added: false, plan: existing };
  const plan = hydrate(template);
  return { plans: write([plan, ...plans]), added: true, plan };
}

export function addCustomPlan(input: {
  title: string;
  subtitle: string;
  category: PlanCategory;
  frequency: string;
}) {
  const plan = hydrate({
    title: input.title,
    subtitle: input.subtitle || '从今天开始，给自己一个轻轻的约定',
    category: input.category,
    icon: '/static/illustrations/custom-plan-planning.png',
    tint: '#f5eadf',
    frequency: input.frequency || '每天 1 个小行动',
    tasks: [{ title: input.title, note: '完成后给自己一个小小的肯定' }],
  });
  return { plans: write([plan, ...read()]), plan };
}

export function toggleHabitTask(planId: string, taskId: string, date = today()) {
  const plans = read();
  const plan = plans.find((item) => item.id === planId);
  const task = plan?.tasks.find((item) => item.id === taskId);
  if (!task) return plans;
  task.doneDates = task.doneDates.includes(date)
    ? task.doneDates.filter((item) => item !== date)
    : [...task.doneDates, date];
  return write(plans);
}

export function removeHabitPlan(planId: string) {
  return write(read().filter((plan) => plan.id !== planId));
}

export function updateHabitPlan(
  planId: string,
  patch: Partial<Pick<HabitPlan, 'title' | 'subtitle' | 'frequency'>>,
) {
  const plans = read();
  const plan = plans.find((item) => item.id === planId);
  if (!plan) return plans;
  Object.assign(plan, patch);
  return write(plans);
}

export function addHabitTask(planId: string, title: string, note = '完成后给自己一个小小的肯定') {
  const plans = read();
  const plan = plans.find((item) => item.id === planId);
  if (!plan || !title.trim()) return plans;
  plan.tasks.push({
    id: `${plan.id}-task-${Date.now()}`,
    title: title.trim(),
    note,
    doneDates: [],
  });
  return write(plans);
}

export function isTaskDone(task: { doneDates: string[] }, date = today()) {
  return task.doneDates.includes(date);
}

export function planStats(plan: HabitPlan, date = today()) {
  const completed = plan.tasks.filter((task) => isTaskDone(task, date)).length;
  return {
    completed,
    total: plan.tasks.length,
    progress: plan.tasks.length ? Math.round((completed / plan.tasks.length) * 100) : 0,
  };
}

export function streakFor(plan: HabitPlan) {
  let streak = 0;
  const cursor = new Date();
  while (true) {
    const date = new Date(cursor.getTime() - cursor.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
    if (!plan.tasks.length || !plan.tasks.every((task) => task.doneDates.includes(date))) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function weekCheckins(plans: HabitPlan[]) {
  const dates = new Set<string>();
  for (let offset = 0; offset < 7; offset += 1) {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    dates.add(
      new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10),
    );
  }
  return plans.reduce(
    (sum, plan) =>
      sum +
      plan.tasks.reduce(
        (taskSum, task) => taskSum + task.doneDates.filter((date) => dates.has(date)).length,
        0,
      ),
    0,
  );
}

export function weekSummary(plans: HabitPlan[]) {
  const labels = ['日', '一', '二', '三', '四', '五', '六'];
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
    const completed = plans.reduce(
      (sum, plan) => sum + plan.tasks.filter((task) => task.doneDates.includes(key)).length,
      0,
    );
    return { key, label: labels[date.getDay()], completed };
  });
}
