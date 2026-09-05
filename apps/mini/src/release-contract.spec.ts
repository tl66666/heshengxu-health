import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../../..');

describe('release contracts', () => {
  it('does not ship local-development instructions in the food catalog', () => {
    const source = readFileSync(resolve(root, 'apps/mini/src/pages/food-search/FoodSearchPage.vue'), 'utf8');
    expect(source).not.toContain('start-dev.bat');
    expect(source).not.toContain('127.0.0.1');
  });

  it('uses the branded Xuxu artwork for App icons', () => {
    const manifest = JSON.parse(readFileSync(resolve(root, 'apps/mini/src/manifest.json'), 'utf8')) as {
      'app-plus'?: { distribute?: { icons?: { android?: Record<string, string>; ios?: { appstore?: string } } } };
    };
    const icons = manifest['app-plus']?.distribute?.icons;
    expect(icons?.android?.xxhdpi).toBe('static/app-icons/xxhdpi.png');
    expect(icons?.ios?.appstore).toBe('static/app-icons/ios-appstore.png');
  });

  it('keeps the showcase footer free of the decorative leaf image', () => {
    const source = readFileSync(resolve(root, 'showcase/index.html'), 'utf8');
    expect(source).not.toContain('footer-leaf');
    expect(source).not.toContain('leaf-corner-decoration.png');
  });
});
