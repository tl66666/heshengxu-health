import { navigationLayout } from './navigation-layout.js';
/** Viewport rects plus current offset work consistently on WeChat and H5. */
export function readingScrollTop(sectionTop: number, scrollTop: number, headerHeight: number) {
  if (![sectionTop, scrollTop, headerHeight].every(Number.isFinite)) return null;
  return Math.max(0, scrollTop + sectionTop - Math.max(0, headerHeight) - 12);
}
export function scrollToReadingSection(selector: string, onFailure: () => void) {
  try {
    const system = uni.getSystemInfoSync();
    let capsule;
    try {
      capsule = uni.getMenuButtonBoundingClientRect?.();
    } catch {
      /* App has no capsule. */
    }
    const layout = navigationLayout(system, capsule);
    uni
      .createSelectorQuery()
      .select(selector)
      .boundingClientRect()
      .selectViewport()
      .scrollOffset(() => undefined)
      .exec((measurements) => {
        const [section, viewport] = measurements as [
          { top?: number } | null,
          { scrollTop?: number } | null,
        ];
        const target = readingScrollTop(
          section?.top ?? NaN,
          viewport?.scrollTop ?? NaN,
          layout.statusBarHeight + layout.barHeight,
        );
        if (target === null) {
          onFailure();
          return;
        }
        uni.pageScrollTo({ scrollTop: target, duration: 0, fail: onFailure });
      });
  } catch {
    onFailure();
  }
}
