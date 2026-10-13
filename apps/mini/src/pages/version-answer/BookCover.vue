<template>
  <view :class="['shelf-book-cover', topic]">
    <image
      v-if="bookCovers[topic] && !failed"
      :src="bookCovers[topic]"
      class="shelf-cover-image"
      mode="aspectFit"
      @error="failed = true"
    />
    <view v-else class="shelf-cover-fallback" />
    <view class="shelf-cover-lettering"
      ><text v-for="line in lettering" :key="line">{{ line }}</text
      ><text class="shelf-cover-edition">FIELD GUIDE</text></view
    >
  </view>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import type { TopicId } from '../../features/version-answer/content.js';
import { bookCovers } from '../../features/version-answer/book-art.js';
const props = defineProps<{ topic: TopicId }>();
const failed = ref(false);
const lettering = computed(
  () =>
    ({
      muscle: ['薄肌', '圣经'],
      sun: ['孙学', '视角'],
      water: ['大水', '理论'],
      codex: ['Codex', '实践'],
      life: ['高性价比', '人生指南'],
    })[props.topic],
);
</script>
<style scoped>
.shelf-book-cover {
  position: relative;
  width: 184rpx;
  height: 276rpx;
  filter: drop-shadow(5rpx 9rpx 5rpx #46341f35);
}
.shelf-cover-image {
  width: 100%;
  height: 100%;
}
.shelf-cover-lettering {
  position: absolute;
  left: 40rpx;
  right: 20rpx;
  top: 59rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #ecd39a;
  font-family: Georgia, 'Songti SC', 'STSong', 'SimSun', serif;
  line-height: 1.5;
  transform: rotate(-1deg);
  pointer-events: none;
  text-shadow: 0 1rpx #27281f;
}
.shelf-cover-lettering > text {
  font-size: 27rpx;
  font-weight: 700;
  letter-spacing: 5rpx;
}
.codex .shelf-cover-lettering {
  color: #d5e3ec;
}
.codex .shelf-cover-lettering > text {
  font-size: 23rpx;
  letter-spacing: 1rpx;
}
.life .shelf-cover-lettering > text {
  font-size: 20rpx;
  letter-spacing: 2rpx;
}
.shelf-book-cover .shelf-cover-lettering .shelf-cover-edition {
  font-family: Georgia, serif;
  font-size: 10rpx;
  letter-spacing: 1rpx;
  font-weight: 400;
  margin-top: 9rpx;
}
.shelf-cover-fallback {
  position: absolute;
  inset: 16rpx 12rpx 18rpx;
  border: 4rpx double #c4a874;
  border-radius: 8rpx 15rpx 15rpx 8rpx;
  background: linear-gradient(90deg, #263d36, #4c6450 15%, #374e41);
  box-shadow:
    inset 12rpx 0 #1c302d50,
    3rpx 5rpx 0 #e1cfac;
}
.sun .shelf-cover-fallback {
  background: linear-gradient(90deg, #714128, #a77945);
}
.codex .shelf-cover-fallback {
  background: linear-gradient(90deg, #293340, #536878);
}
.water .shelf-cover-fallback {
  background: linear-gradient(90deg, #315361, #638c99);
}
.life .shelf-cover-fallback {
  background: linear-gradient(90deg, #4d542d, #77865a);
}
</style>

<style scoped>
.water .shelf-cover-fallback::after {
  content: '';
  position: absolute;
  width: 29rpx;
  height: 29rpx;
  bottom: 43rpx;
  left: 64rpx;
  border: 2rpx solid #d1c597;
  border-radius: 0 70% 70%;
  transform: rotate(45deg);
}
</style>
