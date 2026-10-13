import { userStorageKey } from '../auth/user-storage.js';
import { getGuide } from './content.js';
import { actionStepsFor } from './learning.js';
import { bibleChapters } from '../lean-muscle/bible.js';
export type GuideAction = {
  guideId: string;
  title: string;
  done: boolean;
  createdAt: string;
  dueDate: string | null;
  note: string;
  checkedSteps: number[];
};
export type Library = {
  version: 1;
  bookmarks: string[];
  readingId: string | null;
  completedGuideIds: string[];
  completedBibleIds: string[];
  actions: GuideAction[];
  largeText: boolean;
};
const KEY = 'heban.version-answer.v1';
function empty(): Library {
  return {
    version: 1,
    bookmarks: [],
    readingId: null,
    completedGuideIds: [],
    completedBibleIds: [],
    actions: [],
    largeText: false,
  };
}
export function validActionDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T00:00:00Z');
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
function knownIds(value: unknown, allowed: (id: string) => unknown): string[] {
  return Array.isArray(value)
    ? [...new Set<string>(value.filter((id: unknown) => typeof id === 'string' && allowed(id)))]
    : [];
}
function cleanAction(value: unknown): GuideAction | null {
  if (!value || typeof value !== 'object') return null;
  const a = value as Record<string, unknown>;
  const guide = typeof a.guideId === 'string' ? getGuide(a.guideId) : null;
  if (!guide || typeof a.done !== 'boolean' || typeof a.createdAt !== 'string') return null;
  const count = actionStepsFor(guide).length;
  return {
    guideId: guide.id,
    title: typeof a.title === 'string' && a.title.trim() ? a.title.slice(0, 240) : guide.action,
    done: a.done,
    createdAt: a.createdAt,
    dueDate: typeof a.dueDate === 'string' && validActionDate(a.dueDate) ? a.dueDate : null,
    note: typeof a.note === 'string' ? a.note.slice(0, 500) : '',
    checkedSteps: Array.isArray(a.checkedSteps)
      ? [
          ...new Set<number>(
            a.checkedSteps.filter(
              (i: unknown) => typeof i === 'number' && Number.isInteger(i) && i >= 0 && i < count,
            ),
          ),
        ].sort((a, b) => a - b)
      : [],
  };
}
export function loadLibrary(): Library {
  try {
    const raw = uni.getStorageSync(userStorageKey(KEY));
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!data || data.version !== 1) return empty();
    const actions: GuideAction[] = [];
    if (Array.isArray(data.actions))
      for (const value of data.actions) {
        const action = cleanAction(value);
        if (action && !actions.some((a) => a.guideId === action.guideId)) actions.push(action);
      }
    return {
      version: 1,
      bookmarks: knownIds(data.bookmarks, getGuide),
      readingId:
        typeof data.readingId === 'string' && getGuide(data.readingId) ? data.readingId : null,
      completedGuideIds: knownIds(data.completedGuideIds, getGuide),
      completedBibleIds: knownIds(data.completedBibleIds, (id) =>
        bibleChapters.some((c) => c.id === id),
      ),
      actions,
      largeText: data.largeText === true,
    };
  } catch {
    return empty();
  }
}
function write(state: Library) {
  uni.setStorageSync(userStorageKey(KEY), state);
  return state;
}
function requireGuide(id: string) {
  const guide = getGuide(id);
  if (!guide) throw new Error('这篇指南不存在，请返回目录');
  return guide;
}
export function saveReaderTextSize(largeText: boolean) {
  const state = loadLibrary();
  state.largeText = largeText;
  return write(state);
}
export function bookmarkGuide(id: string, saved: boolean) {
  requireGuide(id);
  const state = loadLibrary();
  state.bookmarks = saved
    ? [...new Set([...state.bookmarks, id])]
    : state.bookmarks.filter((v) => v !== id);
  return write(state);
}
export function saveGuideReading(id: string) {
  requireGuide(id);
  const state = loadLibrary();
  state.readingId = id;
  return write(state);
}
export function markGuideComplete(id: string, done: boolean) {
  requireGuide(id);
  const state = loadLibrary();
  state.completedGuideIds = done
    ? [...new Set([...state.completedGuideIds, id])]
    : state.completedGuideIds.filter((v) => v !== id);
  return write(state);
}
export function markBibleComplete(id: string, done: boolean) {
  if (!bibleChapters.some((c) => c.id === id)) throw new Error('这一章不存在');
  const state = loadLibrary();
  state.completedBibleIds = done
    ? [...new Set([...state.completedBibleIds, id])]
    : state.completedBibleIds.filter((v) => v !== id);
  return write(state);
}
export function addGuideAction(id: string) {
  const guide = requireGuide(id);
  const state = loadLibrary();
  if (!state.actions.some((a) => a.guideId === id))
    state.actions.unshift({
      guideId: id,
      title: guide.action,
      done: false,
      createdAt: new Date().toISOString(),
      dueDate: null,
      note: '',
      checkedSteps: [],
    });
  return write(state);
}
export type ActionDetails = {
  dueDate: string | null;
  note: string;
  checkedSteps: number[];
  done?: boolean;
};
export function saveActionDetails(id: string, details: ActionDetails) {
  const guide = requireGuide(id);
  const state = loadLibrary();
  const action = state.actions.find((a) => a.guideId === id);
  if (!action) throw new Error('请先把这一篇加入行动');
  if (details.dueDate !== null && !validActionDate(details.dueDate))
    throw new Error('请选择真实的日历日期');
  if (typeof details.note !== 'string' || details.note.length > 500)
    throw new Error('笔记请控制在 500 字以内');
  const count = actionStepsFor(guide).length;
  if (
    !Array.isArray(details.checkedSteps) ||
    details.checkedSteps.some((i) => !Number.isInteger(i) || i < 0 || i >= count)
  )
    throw new Error('执行步骤已经变化，请重新打开行动');
  if (details.done !== undefined && typeof details.done !== 'boolean')
    throw new Error('完成状态无效');
  action.dueDate = details.dueDate;
  action.note = details.note;
  action.checkedSteps = [...new Set(details.checkedSteps)].sort((a, b) => a - b);
  if (details.done !== undefined) action.done = details.done;
  return write(state);
}
export function toggleGuideAction(id: string) {
  const state = loadLibrary();
  const action = state.actions.find((a) => a.guideId === id);
  if (!action) throw new Error('行动不存在');
  action.done = !action.done;
  return write(state);
}
export function removeGuideAction(id: string) {
  const state = loadLibrary();
  state.actions = state.actions.filter((a) => a.guideId !== id);
  return write(state);
}
