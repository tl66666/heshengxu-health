export const mePrimaryActions = [
  {
    label: '健康档案',
    detail: '基础资料、身体指标和健康目标',
    route: '/pages/profile/ProfilePage',
    mode: 'navigate',
  },
  {
    label: '我的计划',
    detail: '调整目标方向和每日行动',
    route: '/pages/plan-setup/PlanSetupPage',
    mode: 'navigate',
  },
  {
    label: '健康记录',
    detail: '查看体重、饮食、活动和睡眠记录',
    route: '/pages/records/RecordsPage',
    mode: 'tab',
  },
] as const;
