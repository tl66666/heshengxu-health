import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const consumerFiles = [
  '../src/pages/bootstrap/BootstrapPage.vue',
  '../src/pages/onboarding/OnboardingPage.vue',
  '../src/features/health-loop/health-loop.service.ts',
  '../src/features/health-profile/health-profile.service.ts',
  '../src/features/health-records/health-records.service.ts',
  '../src/features/food/food.service.ts',
  '../src/features/food/food-recognition.ts',
  '../src/features/weekly-review/weekly-review.service.ts',
];

describe('Mini Program API consumers', () => {
  it('does not duplicate a local API base URL or development authorization header', () => {
    for (const relativePath of consumerFiles) {
      const source = readFileSync(new URL(relativePath, import.meta.url), 'utf8');
      expect(source).not.toContain('http://localhost:3000/api/v1');
      expect(source).not.toContain("Authorization: 'Bearer dev-mini-user'");
    }
  });
});
