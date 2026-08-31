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
    expect(homePageSource).not.toContain('const goToWater = () => {\n  uni.navigateTo({');
  });

  it('does not render invented calorie or fasting values', () => {
    expect(homePageSource).not.toContain('<text class="number">1500</text>');
    expect(homePageSource).not.toContain('<text class="fasting-time">01:04:08</text>');
    expect(homePageSource).toContain('{{ mealCount }}');
    expect(homePageSource).toContain('{{ recordingCompleted }}/{{ recordingTotal }}');
  });

  it('keeps meals separate from the single运动 entry and removes weight-card scene art', () => {
    expect(homePageSource).toContain('v-for="action in foodRecordActions"');
    expect(homePageSource).not.toContain('<text class="meal-name">运动</text>');
    expect(homePageSource).toContain('<text class="grid-title">运动</text>');
    expect(homePageSource).toContain(
      '@tap="openRecordAction(\'/pages/records/RecordsPage?type=activity\')"',
    );
    expect(homePageSource).not.toContain('weight-weighing-scene.png');
    expect(homePageSource).toContain('meal-icon-wrap');
    expect(homePageSource).toContain('/static/icons/camera.jpg');
    expect(homePageSource).not.toContain(
      'class="camera-decoration"\n            src="/static/illustrations/home-companion-banner.png"',
    );
  });

  it('links the home editor to a registered page', () => {
    expect(homePageSource).toContain('/pages/home/edit-cards/EditCardsPage');
  });
});
