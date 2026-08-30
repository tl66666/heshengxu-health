export type PlanCategory =
  | 'weight'
  | 'food'
  | 'drink'
  | 'study'
  | 'exercise'
  | 'sleep'
  | 'mood'
  | 'custom';

export type HabitTask = {
  id: string;
  title: string;
  note: string;
  doneDates: string[];
};

export type HabitPlan = {
  id: string;
  title: string;
  subtitle: string;
  category: PlanCategory;
  icon: string;
  tint: string;
  frequency: string;
  createdAt: string;
  tasks: HabitTask[];
};

export type PlanTemplate = Omit<HabitPlan, 'id' | 'createdAt' | 'tasks'> & {
  tasks: Array<Pick<HabitTask, 'title' | 'note'>>;
};
