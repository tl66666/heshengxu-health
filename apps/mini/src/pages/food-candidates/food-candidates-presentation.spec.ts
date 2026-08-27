import { describe, expect, it } from 'vitest';
import foodCandidatesPageSource from './FoodCandidatesPage.vue?raw';

describe('food candidates presentation', () => {
  it('keeps candidate markers fixed while only the copy column expands', () => {
    expect(foodCandidatesPageSource).toContain('class="candidate-copy"');
    expect(foodCandidatesPageSource).toContain('.candidate-copy {');
    expect(foodCandidatesPageSource).not.toContain('.candidate view {');
    expect(foodCandidatesPageSource).toContain('mode="aspectFill"');
  });
});
