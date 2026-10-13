import { describe, expect, it } from 'vitest';
import { reconcileActionDraft } from './drafts.js';
import type { GuideAction } from './store.js';
const action: GuideAction = {
  guideId: 'codex-start',
  title: 'test',
  done: false,
  createdAt: '2026-10-13',
  note: '',
  dueDate: null,
  checkedSteps: [],
};
describe('execution drafts', () => {
  it('keeps unsaved notes, dates and steps when another action causes a reload', () => {
    const draft = { note: '尚未保存的观察', dueDate: '2026-10-20', checkedSteps: [1] };
    expect(reconcileActionDraft(draft, action, { ...action })).toEqual({ draft, conflict: false });
  });
  it('recognizes its own successful save even when step ordering changes', () => {
    const draft = { note: '已保存', dueDate: null, checkedSteps: [2, 0] };
    const saved = { ...action, ...draft, checkedSteps: [0, 2] };
    expect(reconcileActionDraft(draft, action, saved)).toEqual({
      draft: { note: '已保存', dueDate: null, checkedSteps: [0, 2] },
      conflict: false,
    });
  });
  it('keeps an edited draft while reporting a conflicting saved update', () => {
    const draft = { note: '我的草稿', dueDate: null, checkedSteps: [] };
    expect(reconcileActionDraft(draft, action, { ...action, note: '别处已保存的内容' })).toEqual({
      draft,
      conflict: true,
    });
  });
  it('loads changed saved details when there is no unsaved work', () => {
    expect(
      reconcileActionDraft({ note: '', dueDate: null, checkedSteps: [] }, action, {
        ...action,
        note: '新的记录',
      }).draft.note,
    ).toBe('新的记录');
  });
});
