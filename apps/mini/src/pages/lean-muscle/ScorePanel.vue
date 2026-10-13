<template>
  <view class="panel score-panel">
    <view class="section-top"
      ><view class="row"
        ><LeanArt kind="score" class="score-art" /><text class="section-title">薄肌评分</text></view
      ><text class="pill">{{ score.paused ? '恢复周' : '养成表现' }}</text></view
    >
    <view class="score-summary"
      ><view
        class="score-orbit"
        :style="{ background: `conic-gradient(#bd9450 ${score.lower * 3.6}deg, #ece3d2 0deg)` }"
        ><view class="score-inner"
          ><text
            :class="['score-number', { 'score-status': score.coverage === 0 || score.paused }]"
            >{{ score.label }}</text
          ><text class="score-footnote">{{
            score.total !== null
              ? '满分 100'
              : score.coverage > 0 && !score.paused
                ? '已确认 — 可能总分'
                : '待完成 / 待记录'
          }}</text></view
        ></view
      ><view class="score-summary-copy"
        ><text class="score-caption">{{
          score.tier ||
          (score.paused
            ? '先把恢复放在前面'
            : score.plan
              ? '让每一次行动有据可循'
              : '从建立自己的目标开始')
        }}</text
        ><text class="muted">记录完整度 {{ score.coverage }}%</text
        ><text class="tiny">固定规则 v1 · 只与自己比较</text></view
      ></view
    >
    <view class="score-dimensions"
      ><view
        v-for="item in score.dimensions"
        :key="item.id"
        :class="['score-dimension', item.id]"
        @tap="expanded = expanded === item.id ? '' : item.id"
        ><view class="row spread"
          ><text>{{ item.title }}</text
          ><text class="score-points"
            >{{ item.points.toFixed(1) }} / {{ item.weight
            }}<text class="tiny">　{{ expanded === item.id ? '收起' : '解释' }}</text></text
          ></view
        ><view class="score-track"
          ><view :style="{ width: `${Math.min(100, (item.points / item.weight) * 100)}%` }" /></view
        ><text v-if="expanded === item.id" class="score-detail"
          >{{ item.detail }}
          {{ item.formula }}
          证据完整度 {{ Math.round(item.coverage * 100) }}%</text
        ></view
      ></view
    >
    <text class="note"
      >区间左侧是已确认的分数，右侧包含尚未记录的可能得分。身体变化需要更长时间观察，未记录不等于没有完成。</text
    >
  </view>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import LeanArt from './LeanArt.vue';
import type { scoreWeek } from '../../features/lean-muscle/score.js';
defineProps<{ score: ReturnType<typeof scoreWeek> }>();
const expanded = ref('');
</script>
<style scoped>
.score-summary {
  display: flex;
  gap: 25rpx;
  align-items: center;
  padding: 12rpx 0 25rpx;
}
.score-orbit {
  width: 178rpx;
  height: 178rpx;
  border: 10rpx solid #e0ead9;
  box-shadow: inset 0 0 0 2rpx #fffefa;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-sizing: border-box;
}
.score-number {
  font-size: 36rpx;
  font-weight: 750;
  line-height: 1.25;
  color: #476c4b;
}
.score-caption {
  display: block;
  font-size: 26rpx;
  font-weight: 650;
  margin-bottom: 8rpx;
}
.score-summary-copy {
  flex: 1;
  min-width: 0;
}
.score-dimension {
  padding: 12rpx 0;
}
.score-points {
  font-size: 24rpx;
  color: #54735b;
}
.score-track {
  height: 9rpx;
  background: #eaf0e4;
  margin: 12rpx 0;
  border-radius: 20rpx;
  overflow: hidden;
}
.score-track view {
  height: 100%;
  background: #85a884;
  border-radius: 20rpx;
}
.score-detail {
  display: block;
  white-space: pre-line;
  color: #70806d;
  font-size: 23rpx;
  padding: 10rpx 0 12rpx;
}
.score-status {
  font-size: 25rpx;
  white-space: nowrap;
}
.score-footnote {
  font-size: 17rpx;
  color: #788779;
  white-space: nowrap;
  margin-top: 5rpx;
}
.score-art {
  width: 42rpx;
  height: 42rpx;
}
.score-orbit {
  border: 0;
  padding: 9rpx;
  width: 192rpx;
  height: 192rpx;
  box-shadow: 0 9rpx 20rpx #8b693b12;
}
.score-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: radial-gradient(circle at 35% 25%, #fffdf7, #f4ecdd);
  box-shadow: inset 0 0 0 2rpx #fff9ec;
}
.score-number {
  color: #876237;
}
.score-track {
  height: 12rpx;
}
.score-caption {
  color: #5b5d53;
}
</style>
