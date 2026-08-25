import { describe, expect, it } from 'vitest';
import { recordPresentation } from './record-presentation.js';

describe('recordPresentation', () => {
  it('shows a gentle reminder only for an absent selected record type', () => {
    expect(
      recordPresentation('sleep', {
        hasWeight: true,
        hasMeal: false,
        hasActivity: false,
        hasSleep: false,
      }),
    ).toEqual({ showReminder: true, isEmpty: false });
    expect(
      recordPresentation('weight', {
        hasWeight: true,
        hasMeal: false,
        hasActivity: false,
        hasSleep: false,
      }),
    ).toEqual({ showReminder: false, isEmpty: false });
  });

  it('uses the desk art state only before any record exists', () => {
    expect(
      recordPresentation('weight', {
        hasWeight: false,
        hasMeal: false,
        hasActivity: false,
        hasSleep: false,
      }),
    ).toEqual({ showReminder: true, isEmpty: true });
  });
});
