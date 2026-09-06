import { describe, expect, it } from 'vitest';
import { parseCandidates } from './cloudbase-food-recognition.provider.js';

describe('CloudBase food recognition response', () => {
  it('keeps an unknown composite dish and its visible components', () => {
    const [candidate] = parseCandidates(JSON.stringify({
      candidates: [{
        name: '猪脚饭',
        confidence: 0.91,
        estimatedGrams: 520,
        estimatedEnergyKcal: 846,
        estimatedProteinG: 35,
        estimatedFatG: 31,
        estimatedCarbohydrateG: 102,
        uncertaintyNote: '酱汁和肥肉比例会影响热量',
        components: [
          { name: '米饭', estimatedGrams: 260, estimatedEnergyKcal: 302 },
          { name: '卤猪脚', estimatedGrams: 190, estimatedEnergyKcal: 470 },
          { name: '青菜', estimatedGrams: 70, estimatedEnergyKcal: 24 },
        ],
      }],
    }));

    expect(candidate).toMatchObject({
      name: '猪脚饭',
      estimatedGrams: 520,
      components: [
        { name: '米饭', estimatedGrams: 260 },
        { name: '卤猪脚', estimatedGrams: 190 },
        { name: '青菜', estimatedGrams: 70 },
      ],
      uncertaintyNote: '酱汁和肥肉比例会影响热量',
    });
  });
});
