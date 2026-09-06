import { describe, expect, it } from 'vitest';
import foodCandidatesPageSource from './FoodCandidatesPage.vue?raw';

describe('food candidates presentation', () => {
  it('keeps candidate markers fixed while only the copy column expands', () => {
    expect(foodCandidatesPageSource).toContain('class="candidate-copy"');
    expect(foodCandidatesPageSource).toContain('.candidate-copy {');
    expect(foodCandidatesPageSource).not.toContain('.candidate view {');
    expect(foodCandidatesPageSource).toContain('mode="aspectFill"');
  });

  it('preselects the strongest dish result and continues to editable confirmation', () => {
    expect(foodCandidatesPageSource).toContain('candidateId.value = candidate.id');
    expect(foodCandidatesPageSource).toContain('defaultRecognitionCandidateId');
    expect(foodCandidatesPageSource).toContain('/pages/food-confirm/FoodConfirmPage?');
    expect(foodCandidatesPageSource).toContain('source=photo');
    expect(foodCandidatesPageSource).toContain('mealType=');
    expect(foodCandidatesPageSource).toContain('imagePath=');
    expect(foodCandidatesPageSource).not.toContain('confirmRecognition');
    expect(foodCandidatesPageSource).not.toContain('confirmRecognition({');
  });

  it('shows estimated calories, macros and visible meal components', () => {
    expect(foodCandidatesPageSource).toContain('class="energy-value"');
    expect(foodCandidatesPageSource).toContain('selectedCandidate?.components');
    expect(foodCandidatesPageSource).toContain('class="component-row"');
    expect(foodCandidatesPageSource).toContain('调整内容与份量');
  });

  it('keeps retry and manual search fallbacks in failed or empty states', () => {
    expect(foodCandidatesPageSource).toContain('manualRecord');
    expect(foodCandidatesPageSource).toContain('/pages/food-search/FoodSearchPage?mealType=');
    expect(foodCandidatesPageSource).toContain('/pages/food-recognition/FoodRecognitionPage?mealType=');
  });
});
