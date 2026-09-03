import { describe, expect, it } from 'vitest';
import homePageRaw from './HomePage.vue?raw';

// 行尾无关：外部编辑器可能把文件转成 CRLF
const homePageSource = homePageRaw.split(String.fromCharCode(13, 10)).join(String.fromCharCode(10));
import homeActionsSource from './home-actions.ts?raw';

describe('home card presentation contracts', () => {
  it('removes decorative add controls from home cards', () => {
    expect(homePageSource).not.toContain('class="add-btn"');
    expect(homePageSource).not.toContain('class="grid-add"');
    expect(homePageSource).not.toMatch(/class="edit-text">\s*\+/);
  });

  it('uses the shared router for the water card entry', () => {
    expect(homePageSource).toContain('<button class="grid-item card water-card"');
    expect(homePageSource).toContain('@tap="goToWater"');
    expect(homePageSource).toContain("navigateTo('/pages/water/WaterPage', {");
  });

  it('does not render invented calorie or fasting values', () => {
    expect(homePageSource).not.toContain('<text class="number">1500</text>');
    expect(homePageSource).not.toContain('<text class="fasting-time">01:04:08</text>');
    expect(homePageSource).toContain('{{ mealCount }}');
    expect(homePageSource).toContain('const recordingCompleted = computed');
    expect(homePageSource).toContain('const recordingTotal = computed');
  });

  it('keeps meals separate from the single运动 entry and removes weight-card scene art', () => {
    expect(homePageSource).toContain('v-for="action in foodRecordActions"');
    expect(homePageSource).not.toContain('<text class="meal-name">运动</text>');
    expect(homePageSource).toContain('<text class="grid-title">运动</text>');
    expect(homePageSource).toContain('@tap="go(\'/pages/activity/ActivityDetailPage\')"');
    expect(homePageSource).not.toContain('weight-weighing-scene.png');
    expect(homePageSource).toContain('meal-icon-wrap');
    expect(homePageSource).toContain('/static/icons/camera.png');
    expect(homePageSource).not.toContain(
      'class="camera-decoration"\n            src="/static/illustrations/home-companion-banner.png"',
    );
  });

  it('links the home editor to a registered page', () => {
    expect(homePageSource).toContain('/pages/home/edit-cards/EditCardsPage');
  });

  it('uses the transparent meal and camera artwork on the home food card', () => {
    expect(homeActionsSource).toContain('/static/icons/breakfast.png');
    expect(homeActionsSource).toContain('/static/icons/lunch.png');
    expect(homeActionsSource).toContain('/static/icons/dinner.png');
    expect(homeActionsSource).toContain('/static/icons/snack.png');
    expect(homePageSource).toContain('/static/icons/camera.png');
    expect(homePageSource).not.toContain('/static/icons/camera.jpg');
  });

  it('keeps meal artwork bright and gives home buttons one consistent pressed state', () => {
    expect(homePageSource).toContain('.meal-icon {\n  width: 76rpx;\n  height: 76rpx;\n}');
    expect(homePageSource).toContain('.meal-item:nth-child(3) .meal-icon');
    expect(homePageSource).toContain('.meal-item:nth-child(4) .meal-icon');
    expect(homePageSource).toContain('.camera-decoration { filter: none; }');
    expect(homePageSource).toContain('.button-hover,');
    expect(homePageSource).toContain('transform: scale(0.975)');
    expect(homePageSource).toContain('animation: none');
  });
});
