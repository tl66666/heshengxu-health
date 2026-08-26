import { describe, expect, it } from 'vitest';
import { foodConfirmMode } from './food-entry-form.js';

describe('food entry confirmation mode', () => {
  it('uses edit mode only when a record id is provided', () => {
    expect(foodConfirmMode('entry-1')).toBe('edit');
    expect(foodConfirmMode(undefined)).toBe('create');
  });
});
