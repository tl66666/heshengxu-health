import { describe, expect, it } from 'vitest';
import foodCandidatesPageSource from './FoodCandidatesPage.vue?raw';

describe('food candidates presentation', () => {
  it('keeps candidate markers fixed while only the copy column expands', () => {
    expect(foodCandidatesPageSource).toContain('class="candidate-copy"');
    expect(foodCandidatesPageSource).toContain('.candidate-copy {');
    expect(foodCandidatesPageSource).not.toContain('.candidate view {');
    expect(foodCandidatesPageSource).toContain('mode="aspectFill"');
  });

  it('requires an explicit candidate choice and continues to the shared confirmation page', () => {
    expect(foodCandidatesPageSource).toContain('candidateId.value = candidate.id');
    expect(foodCandidatesPageSource).toContain('/pages/food-confirm/FoodConfirmPage?');
    expect(foodCandidatesPageSource).toContain('source=photo');
    expect(foodCandidatesPageSource).toContain('mealType=');
    expect(foodCandidatesPageSource).toContain('imagePath=');
    expect(foodCandidatesPageSource).not.toContain('confirmRecognition');
    expect(foodCandidatesPageSource).not.toContain('confirmRecognition({');
  });

  it('keeps retry and manual search fallbacks in failed or empty states', () => {
    expect(foodCandidatesPageSource).toContain('manualRecord');
    expect(foodCandidatesPageSource).toContain('/pages/food-search/FoodSearchPage?mealType=');
    expect(foodCandidatesPageSource).toContain('/pages/food-recognition/FoodRecognitionPage?mealType=');
  });
});
