import { describe, expect, it } from 'vitest';
import planPageSource from './PlanPage.vue?raw';
import taskListSource from '../../components/plans/PlanTaskList.vue?raw';
import createSheetSource from '../../components/plans/PlanCreateSheet.vue?raw';

describe('plan visual system', () => {
  it('keeps the page on a clean white canvas with the shared green palette', () => {
    expect(planPageSource).toContain('background: #ffffff');
    expect(planPageSource).toContain('color: #365343');
    expect(planPageSource).not.toContain('#fff7f1');
    expect(planPageSource).not.toContain('#fff0f1');
  });

  it('does not reintroduce legacy pink task or sheet states', () => {
    for (const source of [taskListSource, createSheetSource]) {
      expect(source).not.toContain('#fff0f1');
      expect(source).not.toContain('#b66d80');
      expect(source).toContain('#6f9f7a');
    }
  });
});
