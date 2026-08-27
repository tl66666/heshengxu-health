import { describe, expect, it } from 'vitest';
import type { HealthRecordType } from '../../../../../packages/contracts/src/health-loop.js';
import { consumeRecordTypeFocus, requestRecordTypeFocus } from './records-focus.js';

describe('records focus handoff for tab-safe navigation', () => {
  it('delivers the requested record type once and then clears it', () => {
    const type: HealthRecordType = 'sleep';
    requestRecordTypeFocus(type);

    expect(consumeRecordTypeFocus()).toBe(type);
    expect(consumeRecordTypeFocus()).toBeNull();
  });

  it('starts empty and allows overwriting a pending request', () => {
    expect(consumeRecordTypeFocus()).toBeNull();

    requestRecordTypeFocus('weight');
    requestRecordTypeFocus('activity');

    expect(consumeRecordTypeFocus()).toBe('activity');
  });
});
