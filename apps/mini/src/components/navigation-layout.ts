/** Geometry for custom headers shared by WeChat, App and browser previews. */
export function navigationLayout(
  system: { statusBarHeight?: number; windowWidth?: number } = {},
  capsule?: { left: number; right: number; top: number; bottom: number },
) {
  const statusBarHeight = Number.isFinite(system.statusBarHeight)
    ? Math.max(0, Math.min(80, Number(system.statusBarHeight)))
    : 0;
  const windowWidth =
    Number.isFinite(system.windowWidth) && Number(system.windowWidth) >= 240
      ? Number(system.windowWidth)
      : 375;
  const fallback = { statusBarHeight, barHeight: 44, rightInset: 12 };
  if (!capsule || !Object.values(capsule).every(Number.isFinite)) return fallback;
  const height = capsule.bottom - capsule.top;
  const width = capsule.right - capsule.left;
  if (
    capsule.left < windowWidth / 2 ||
    capsule.right > windowWidth ||
    width < 40 ||
    width > 200 ||
    height < 20 ||
    height > 60 ||
    capsule.top < statusBarHeight ||
    capsule.top - statusBarHeight > 24
  )
    return fallback;
  return {
    statusBarHeight,
    barHeight: Math.max(44, Math.min(88, (capsule.top - statusBarHeight) * 2 + height)),
    rightInset: windowWidth - capsule.left + 12,
  };
}
