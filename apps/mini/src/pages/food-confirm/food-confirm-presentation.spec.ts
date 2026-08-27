import { describe, expect, it } from 'vitest';
import foodConfirmPageSource from './FoodConfirmPage.vue?raw';

describe('food confirmation presentation', () => {
  it('uses the shared navigation and keeps nutrition preview visible', () => {
    expect(foodConfirmPageSource).toContain('<AppNavBar title="确认这份食物"');
    expect(foodConfirmPageSource).toContain('class="nutrition"');
    expect(foodConfirmPageSource).toContain('class="save"');
    expect(foodConfirmPageSource).not.toContain('class="back"');
    expect(foodConfirmPageSource).not.toContain('>‹</button>');
  });
});
