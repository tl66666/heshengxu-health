/**
 * 统一的路由跳转工具
 * 自动判断是否为 tabBar 页面，使用正确的跳转方法
 */

// tabBar 页面列表
const TAB_BAR_PAGES = [
  '/pages/home/HomePage',
  '/pages/records/RecordsPage',
  '/pages/xuxu/XuxuPage',
  '/pages/plan/PlanPage',
  '/pages/me/MePage',
];

/**
 * 判断是否为 tabBar 页面
 */
function isTabBarPage(url: string): boolean {
  return TAB_BAR_PAGES.some(page => url.includes(page));
}

/**
 * 统一的页面跳转方法
 * 自动判断使用 navigateTo 还是 switchTab
 */
export function navigateTo(url: string, options?: { fail?: (err: any) => void }) {
  if (!url) {
    console.error('[router] 跳转URL不能为空');
    return;
  }

  // 如果是 tabBar 页面，使用 switchTab
  if (isTabBarPage(url)) {
    uni.switchTab({
      url,
      fail: (err) => {
        console.error('[router] switchTab 失败:', err);
        options?.fail?.(err);
      },
    });
  } else {
    // 非 tabBar 页面，使用 navigateTo
    uni.navigateTo({
      url,
      fail: (err) => {
        console.error('[router] navigateTo 失败:', err);
        options?.fail?.(err);
      },
    });
  }
}

/**
 * 重定向到页面（关闭当前页面）
 */
export function redirectTo(url: string, options?: { fail?: (err: any) => void }) {
  if (!url) {
    console.error('[router] 跳转URL不能为空');
    return;
  }

  // tabBar 页面不能使用 redirectTo，改用 switchTab
  if (isTabBarPage(url)) {
    uni.switchTab({
      url,
      fail: (err) => {
        console.error('[router] switchTab 失败:', err);
        options?.fail?.(err);
      },
    });
  } else {
    uni.redirectTo({
      url,
      fail: (err) => {
        console.error('[router] redirectTo 失败:', err);
        options?.fail?.(err);
      },
    });
  }
}

/**
 * 返回上一页
 */
export function navigateBack(delta: number = 1) {
  const pages = getCurrentPages();
  
  if (pages.length > delta) {
    uni.navigateBack({ delta });
  } else {
    // 如果没有上一页，跳转到首页
    uni.switchTab({ url: '/pages/home/HomePage' });
  }
}

/**
 * 重新启动到首页
 */
export function reLaunchToHome() {
  uni.reLaunch({ url: '/pages/home/HomePage' });
}

/**
 * 切换到 tabBar 页面
 */
export function switchTab(url: string, options?: { fail?: (err: any) => void }) {
  if (!url) {
    console.error('[router] 跳转URL不能为空');
    return;
  }

  // tabBar 页面不支持 queryString，需要移除
  const cleanUrl = url.split('?')[0];

  uni.switchTab({
    url: cleanUrl,
    fail: (err) => {
      console.error('[router] switchTab 失败:', err);
      options?.fail?.(err);
    },
  });
}

/**
 * 跳转到食物搜索页
 */
export function navigateToFoodSearch() {
  navigateTo('/pages/food-search/FoodSearchPage');
}

/**
 * 跳转到食物详情页
 */
export function navigateToFoodDetail(foodId: string) {
  navigateTo(`/pages/food-detail/FoodDetailPage?foodId=${encodeURIComponent(foodId)}`);
}

/**
 * 跳转到食物确认页
 */
export function navigateToFoodConfirm(foodId: string) {
  navigateTo(`/pages/food-confirm/FoodConfirmPage?foodId=${encodeURIComponent(foodId)}`);
}

/**
 * 跳转到食物识别页
 */
export function navigateToFoodRecognition() {
  navigateTo('/pages/food-recognition/FoodRecognitionPage');
}

/**
 * 跳转到体重详情页
 */
export function navigateToWeightDetail() {
  navigateTo('/pages/weight/WeightDetailPage');
}

/**
 * 跳转到序序对话页
 */
export function navigateToXuxu() {
  switchTab('/pages/xuxu/XuxuPage');
}

/**
 * 跳转到首页
 */
export function navigateToHome() {
  switchTab('/pages/home/HomePage');
}

/**
 * 跳转到记录页
 */
export function navigateToRecords() {
  switchTab('/pages/records/RecordsPage');
}

/**
 * 跳转到计划页
 */
export function navigateToPlan() {
  switchTab('/pages/plan/PlanPage');
}

/**
 * 跳转到我的页面
 */
export function navigateToMe() {
  switchTab('/pages/me/MePage');
}
