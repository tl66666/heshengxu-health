import { describe, expect, it } from 'vitest';
import { HOME_CARD_DEFINITIONS, defaultHomeCardVisibility } from './home-card-settings.js';

describe('home card settings', () => {
  it('defines a stable set of editable cards with all cards visible by default', () => {
    expect(HOME_CARD_DEFINITIONS.map((card) => card.id)).toEqual([
      'weight-plan',
      'food',
      'weight-record',
      'tracking',
      'fasting',
      'period',
      'medication',
    ]);
    expect(Object.values(defaultHomeCardVisibility()).every(Boolean)).toBe(true);
    expect(HOME_CARD_DEFINITIONS.map((card) => card.icon)).toEqual([
      '/static/icons/svg/scale.svg',
      '/static/icons/svg/meal.svg',
      '/static/icons/svg/scale.svg',
      '/static/icons/watercolor/activity.png',
      '/static/icons/watercolor/fasting-clock.png',
      '/static/icons/watercolor/menstruation.png',
      '/static/icons/watercolor/medication.png',
    ]);
  });
});
