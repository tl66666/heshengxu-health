import { describe, expect, it } from 'vitest';
import homePageSource from './HomePage.vue?raw';

describe('home card presentation contracts', () => {
  it('removes decorative add controls from home cards', () => {
    expect(homePageSource).not.toContain('class="add-btn"');
    expect(homePageSource).not.toContain('class="grid-add"');
    expect(homePageSource).not.toMatch(/class="edit-text">\s*\+/);
  });

  it('uses the shared router for the water card entry', () => {
    expect(homePageSource).toContain("navigateTo('/pages/water/WaterPage')");
    expect(homePageSource).not.toContain("const goToWater = () => {\n  uni.navigateTo({");
  });
});
