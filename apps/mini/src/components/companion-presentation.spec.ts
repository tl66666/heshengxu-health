import { describe, expect, it } from 'vitest';
import { companionPresentation } from './companion-presentation.js';

describe('companionPresentation', () => {
  it('uses a distinct factual completion treatment', () => {
    expect(companionPresentation('complete')).toEqual({
      className: 'hint--complete',
      name: '序序',
    });
  });

  it('keeps reminder copy in a neutral note treatment', () => {
    expect(companionPresentation('note')).toEqual({
      className: 'hint--note',
      name: '序序',
    });
  });
});
