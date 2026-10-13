<template>
  <view
    class="version-home-card card"
    hover-class="version-home-pressed"
    aria-role="button"
    aria-label="打开版本答案书柜"
    @tap="navigateTo('/pages/version-answer/VersionAnswerPage')"
  >
    <view class="version-home-top"
      ><text class="version-home-title">版本答案</text
      ><text class="version-home-chip">{{
        pending ? `${pending} 个行动待完成` : '从一件小事开始'
      }}</text></view
    >
    <text class="version-home-main">读懂一页，做成一件事。</text>
    <view class="version-home-caption"
      ><text>薄肌 · 孙学 · 饮水</text><text>Codex · 人生指南</text></view
    >
    <image :src="versionEntryScene" class="version-home-art" mode="aspectFit" />
  </view>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { loadLibrary } from '../../features/version-answer/store.js';
import { versionEntryScene } from '../../features/version-answer/art.js';
import { navigateTo } from '../../utils/router.js';
const library = ref(loadLibrary());
onShow(() => {
  library.value = loadLibrary();
});
const pending = computed(() => library.value.actions.filter((a) => !a.done).length);
</script>
<style scoped>
.version-home-card {
  position: relative;
  overflow: hidden;
  min-height: 200rpx;
  box-sizing: border-box;
  padding: 27rpx 28rpx;
  border: 1rpx solid #e6d5b8;
  border-left: 5rpx solid #b99563;
  border-radius: 27rpx;
  background: linear-gradient(115deg, #fff9eb, #f3e9d6 60%, #e9eee9);
  margin-bottom: 24rpx;
  color: #765b3f;
}
.version-home-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14rpx;
  position: relative;
  z-index: 1;
}
.version-home-title {
  font-size: 29rpx;
  font-weight: 700;
  letter-spacing: 1rpx;
}
.version-home-chip {
  font-size: 19rpx;
  color: #9b7c50;
  border: 1rpx solid #ddcaab;
  padding: 5rpx 12rpx;
  border-radius: 18rpx;
  background: #f9f1df;
}
.version-home-main {
  display: block;
  position: relative;
  z-index: 1;
  max-width: 70%;
  font-size: 25rpx;
  line-height: 1.7;
  margin-top: 18rpx;
  font-weight: 550;
}
.version-home-caption {
  display: block;
  position: relative;
  z-index: 1;
  font-size: 18rpx;
  color: #a18b6b;
  margin-top: 11rpx;
  max-width: 62%;
  line-height: 1.7;
}
.version-home-caption text {
  display: block;
}
.version-home-art {
  position: absolute;
  width: 193rpx;
  height: 130rpx;
  right: -3rpx;
  bottom: 3rpx;
}
</style>

<style scoped>
.version-home-card {
  border-radius: 10rpx 26rpx 26rpx 10rpx;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}
.version-home-title {
  font-family: 'Songti SC', 'STSong', 'SimSun', serif;
  font-size: 31rpx;
}
.version-home-caption {
  color: #8a7559;
  font-size: 20rpx;
}
.version-home-pressed {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 10rpx #a0834815;
}
@media (prefers-reduced-motion: reduce) {
  .version-home-card {
    transition: none;
  }
}
</style>
