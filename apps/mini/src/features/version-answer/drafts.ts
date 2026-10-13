import type { ActionDetails, GuideAction } from './store.js';
export function actionDraft(action: GuideAction): ActionDetails {
  return { note: action.note, dueDate: action.dueDate, checkedSteps: [...action.checkedSteps] };
}
function same(a: ActionDetails, b: ActionDetails) {
  return (
    a.note === b.note &&
    a.dueDate === b.dueDate &&
    [...a.checkedSteps].sort((a, b) => a - b).join(',') ===
      [...b.checkedSteps].sort((a, b) => a - b).join(',')
  );
}
export function reconcileActionDraft(
  draft: ActionDetails,
  previous: GuideAction,
  next: GuideAction,
) {
  const oldSaved = actionDraft(previous);
  const newSaved = actionDraft(next);
  if (same(draft, oldSaved) || same(draft, newSaved)) return { draft: newSaved, conflict: false };
  return {
    draft: { note: draft.note, dueDate: draft.dueDate, checkedSteps: [...draft.checkedSteps] },
    conflict: !same(oldSaved, newSaved),
  };
}
