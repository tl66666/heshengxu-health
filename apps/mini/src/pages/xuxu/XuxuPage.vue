<template>
  <view class="page"
    ><view class="welcome"
      ><image
        class="welcome-art"
        src="/static/illustrations/xuxu-ai-empty.png"
        mode="aspectFill"
      /><view class="welcome-copy"
        ><view class="identity"
          ><image src="/static/illustrations/xuxu-avatar.jpg" mode="aspectFill" /><text
            >序序</text
          ></view
        ><text class="eyebrow">你好，我是序序</text
        ><text class="title">今天想从哪里开始照顾自己？</text
        ><text class="hint">我会结合你已记录的信息，给出健康管理参考，不替代医生诊疗。</text></view
      ></view
    ><view class="current"
      ><text class="label">我看到的今天</text
      ><text>{{
        today?.dailyAction.description || '先设置一个计划，我们再从一件小事开始。'
      }}</text></view
    ><view class="section-title">快捷问问</view
    ><view class="questions"
      ><button v-for="item in questions" :key="item.title" @tap="answer = item.answer">
        <text>{{ item.icon }}</text
        ><view
          ><text>{{ item.title }}</text
          ><text>{{ item.subtitle }}</text></view
        ><text>›</text>
      </button></view
    ><view v-if="answer" class="answer"
      ><XuxuHint :message="answer" /><button @tap="answer = ''">收起</button></view
    ><view class="safety"
      ><image src="/static/illustrations/xuxu-safe-support.png" mode="aspectFill" /><view
        ><text>需要专业帮助时</text
        ><text>如果出现持续不适或紧急症状，请及时联系医生或当地急救服务。</text></view
      ></view
    ></view
  >
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import XuxuHint from '../../components/XuxuHint.vue';
import { healthLoopState } from '../../features/health-loop/health-loop.store.js';
const date = localDate();
const today = healthLoopState.today;
const answer = ref('');
const questions = [
  {
    icon: '◌',
    title: '为什么要记录体重？',
    subtitle: '看见长期变化',
    answer:
      '连续记录可以帮助你看见趋势。单次数值会受饮水、作息等影响，不需要因为一次变化责备自己。',
  },
  {
    icon: '◐',
    title: '饮食怎么记才轻松？',
    subtitle: '先看一餐结构',
    answer: '不必从热量开始。先看看一餐里有没有主食、蛋白质和蔬菜，记录会更容易坚持。',
  },
  {
    icon: '⌁',
    title: '今天活动不多怎么办？',
    subtitle: '一点也算数',
    answer: '短暂步行也值得记下。今天能完成一件小行动，就已经在给身体留出活动空间。',
  },
  {
    icon: '☾',
    title: '睡眠记录有什么用？',
    subtitle: '理解自己的节律',
    answer: '睡眠记录可以帮助你回看作息是否稳定。它是生活节律参考，不会替代任何医学诊断。',
  },
];
function localDate() {
  const n = new Date();
  return new Date(n.getTime() - n.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
onShow(() => healthLoopState.loadToday(date));
</script>
<style scoped>
.page {
  min-height: 100vh;
  box-sizing: border-box;
  padding: 44rpx 32rpx 166rpx;
  background: #f7fbf8;
  color: #1d3d2a;
}
.welcome {
  position: relative;
  overflow: hidden;
  border: 2rpx solid #eadfb8;
  border-radius: 22rpx;
  background: #fffbed;
}
.welcome-art {
  width: 100%;
  height: 250rpx;
}
.welcome-copy {
  padding: 0 24rpx 28rpx;
  text-align: left;
}
.identity {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-top: -28rpx;
  position: relative;
  z-index: 1;
  color: #6a5b3d;
  font-size: 22rpx;
  font-weight: 700;
}
.identity image {
  width: 66rpx;
  height: 66rpx;
  border: 4rpx solid #fffbed;
  border-radius: 50%;
  background: #fff9df;
}
.eyebrow,
.title,
.hint {
  display: block;
}
.eyebrow {
  margin-top: 18rpx;
  color: #668e76;
  font-size: 23rpx;
  font-weight: 700;
}
.title {
  margin-top: 9rpx;
  font-size: 36rpx;
  font-weight: 700;
}
.hint {
  margin: 12rpx auto 0;
  color: #708a7a;
  font-size: 23rpx;
  line-height: 1.6;
}
.current {
  margin-top: 30rpx;
  padding: 22rpx;
  border: 2rpx solid #ebdfb4;
  border-radius: 18rpx;
  background: #f2f8f2;
}
.current text {
  display: block;
  color: #5f5c43;
  font-size: 24rpx;
  line-height: 1.55;
}
.current .label {
  margin-bottom: 7rpx;
  color: #78683c;
  font-size: 22rpx;
  font-weight: 700;
}
.section-title {
  margin: 30rpx 0 16rpx;
  font-size: 30rpx;
  font-weight: 700;
}
.questions {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.questions button {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 20rpx;
  border: 2rpx solid #dceadd;
  border-radius: 17rpx;
  text-align: left;
  background: #fff;
}
.questions button > text:first-child {
  color: #5b9a70;
  font-size: 34rpx;
}
.questions view {
  flex: 1;
}
.questions view text {
  display: block;
  color: #2e513b;
  font-size: 27rpx;
  font-weight: 700;
}
.questions view text:last-child {
  margin-top: 5rpx;
  color: #778e80;
  font-size: 22rpx;
  font-weight: 400;
}
.questions button > text:last-child {
  color: #579066;
  font-size: 36rpx;
}
.answer {
  margin-top: 22rpx;
}
.answer button {
  display: block;
  margin: 14rpx auto;
  color: #62816d;
  background: transparent;
  font-size: 22rpx;
}
.safety {
  display: flex;
  align-items: center;
  gap: 14rpx;
  margin-top: 28rpx;
  padding: 14rpx 16rpx;
  border: 2rpx solid #e0e9e0;
  border-radius: 16rpx;
  background: #f5f9f4;
}
.safety image {
  width: 78rpx;
  height: 78rpx;
  flex: none;
  border-radius: 14rpx;
}
.safety view {
  min-width: 0;
}
.safety text {
  display: block;
  color: #4b6f55;
  font-size: 22rpx;
  font-weight: 700;
}
.safety text:last-child {
  margin-top: 5rpx;
  color: #788e7e;
  font-size: 20rpx;
  font-weight: 400;
  line-height: 1.45;
}
</style>
