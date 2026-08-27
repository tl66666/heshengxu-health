export type HomeHeroArt = {
  image: string;
  copySide: 'left' | 'right';
  alt: string;
};

// 首页主视觉池：每天按日期轮换一张；所有图都必须完整显示，禁止裁切。
export const homeHeroArtPool: HomeHeroArt[] = [
  {
    image: '/static/illustrations/home-hero-morning.png',
    copySide: 'right',
    alt: '清晨窗边的序序',
  },
  {
    image: '/static/illustrations/home-companion-banner.png',
    copySide: 'left',
    alt: '和序序聊聊今天的状态',
  },
];

function dayIndex(dateKey: string) {
  let hash = 0;
  for (let i = 0; i < dateKey.length; i += 1) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) % 100000;
  }
  return hash;
}

export function pickHomeHeroArt(dateKey: string): HomeHeroArt {
  const index = dayIndex(dateKey) % homeHeroArtPool.length;
  return homeHeroArtPool[index] ?? homeHeroArtPool[0]!;
}
