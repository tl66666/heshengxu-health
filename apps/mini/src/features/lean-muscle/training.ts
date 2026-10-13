import type { LeanPlan } from './types.js';
export const exerciseOptions = [
  {
    id: 'wall-pushup',
    name: '墙面俯卧撑',
    group: '推',
    equipment: '自重',
    tip: '双手撑墙，身体保持直线，选择能稳定完成的距离。',
  },
  {
    id: 'chair-squat',
    name: '坐椅深蹲',
    group: '腿',
    equipment: '自重',
    tip: '使用稳固椅子，缓慢坐下再起身，膝盖顺着脚尖方向。',
  },
  {
    id: 'band-row',
    name: '弹力带划船',
    group: '拉',
    equipment: '弹力带',
    tip: '先检查固定点，拉向躯干，肩膀保持放松。',
  },
  {
    id: 'glute-bridge',
    name: '臀桥',
    group: '腿',
    equipment: '自重',
    tip: '双脚踩稳，缓慢抬起髋部，避免腰部过度后仰。',
  },
  {
    id: 'dead-bug',
    name: '死虫式',
    group: '核心',
    equipment: '自重',
    tip: '缓慢交替伸展对侧手脚，选择能保持腰背稳定的幅度。',
  },
  {
    id: 'pushup',
    name: '标准俯卧撑',
    group: '推',
    equipment: '自重',
    tip: '躯干保持稳定，难以完成时换墙面变式。',
  },
  {
    id: 'dumbbell-row',
    name: '哑铃划船',
    group: '拉',
    equipment: '哑铃',
    tip: '支撑稳定，向髋部方向拉，选择动作可控的重量。',
  },
  {
    id: 'goblet-squat',
    name: '高脚杯深蹲',
    group: '腿',
    equipment: '哑铃',
    tip: '重量靠近胸前，下蹲幅度以稳定和舒适为准。',
  },
  {
    id: 'machine-press',
    name: '器械推胸',
    group: '推',
    equipment: '固定器械',
    tip: '先调整座椅，学习器械使用方式后再开始。',
  },
  {
    id: 'lat-pulldown',
    name: '高位下拉',
    group: '拉',
    equipment: '固定器械',
    tip: '稳定躯干，拉向上胸，避免借身体摆动。',
  },
  {
    id: 'leg-press',
    name: '腿举',
    group: '腿',
    equipment: '固定器械',
    tip: '按器械指导调整位置，避免末端锁死膝盖。',
  },
] as const;
export const DEFAULT_PLAN: LeanPlan = {
  direction: 'strength',
  location: 'home',
  experience: 'beginner',
  trainingDays: [1, 4],
  durationMinutes: 20,
  proteinG: null,
  sleepMinutes: 480,
  representativeId: 'wall-pushup',
  representativeReps: 8,
  representativeLoadKg: 0,
};
export function recommendedExercises(plan: LeanPlan) {
  const ids =
    plan.location === 'gym'
      ? ['machine-press', 'lat-pulldown', 'leg-press', 'dead-bug']
      : ['wall-pushup', 'band-row', 'chair-squat', 'dead-bug'];
  return ids.map((id) => exerciseOptions.find((item) => item.id === id)!);
}
export function exerciseName(id: string) {
  return exerciseOptions.find((item) => item.id === id)?.name || '力量动作';
}
