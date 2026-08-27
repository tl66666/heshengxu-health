import { describe, expect, it } from 'vitest';
import { companionPresentation } from '../../components/companion-presentation.js';
import { recordPresentation } from '../../features/health-loop/record-presentation.js';
import recordsPageSource from './RecordsPage.vue?raw';

describe('supporting screen contracts', () => {
  it('keeps the reminder visible only for an absent selected record type', () => {
    expect(
      recordPresentation('sleep', {
        hasWeight: true,
        hasMeal: true,
        hasActivity: true,
        hasSleep: false,
      }).showReminder,
    ).toBe(true);
    expect(
      recordPresentation('sleep', {
        hasWeight: true,
        hasMeal: true,
        hasActivity: true,
        hasSleep: true,
      }).showReminder,
    ).toBe(false);
  });

  it('keeps Xuxu scoped to deterministic health-management support', () => {
    expect(companionPresentation('note').name).toBe('序序');
    expect(companionPresentation('complete').className).toBe('hint--complete');
  });

  it('uses the shared forward icon for the food entry affordance', () => {
    expect(recordsPageSource).toContain('class="food-entry-arrow" src="/static/icons/forward.svg"');
    expect(recordsPageSource).not.toContain('<text class="food-entry-arrow">›</text>');
  });
});
