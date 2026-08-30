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
    expect(recordsPageSource).toContain(
      'class="food-entry-arrow" src="/static/icons/svg/forward.svg"',
    );
    expect(recordsPageSource).not.toContain('<text class="food-entry-arrow">›</text>');
  });

  it('uses the activity directory, segmented intensity, duration, and calorie estimate', () => {
    expect(recordsPageSource).toContain('v-for="activity in filteredActivities"');
    expect(recordsPageSource).toContain('class="intensity-control"');
    expect(recordsPageSource).toContain('activityMinutes');
    expect(recordsPageSource).toContain('estimatedActivityCalories');
    expect(recordsPageSource).toContain('估算消耗');
  });

  it('uses the existing activity illustration as a semantic banner', () => {
    expect(recordsPageSource).toContain('/static/illustrations/record-desk-banner.png');
    expect(recordsPageSource).toContain('class="activity-banner"');
  });
});
