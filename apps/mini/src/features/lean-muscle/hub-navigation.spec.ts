import { describe, expect, it } from 'vitest';
import { hubDestination } from './hub-navigation.js';
describe('lean hub destinations', () => {
  it('opens training and score from the matching library entrances', () => {
    expect(hubDestination({ tab: 'training' })).toEqual({ tab: 'training', review: false });
    expect(hubDestination({ tab: 'score' })).toEqual({ tab: 'score', review: false });
  });
  it('keeps old bible links and sends weekly review to the score section', () => {
    expect(hubDestination({ tab: 'bible' }).tab).toBe('bible');
    expect(hubDestination({ section: 'review' })).toEqual({ tab: 'score', review: true });
  });
  it('defaults unknown destinations to the daily overview', () => {
    expect(hubDestination({ tab: 'old' }).tab).toBe('overview');
    expect(hubDestination(undefined)).toEqual({ tab: 'overview', review: false });
  });
});
