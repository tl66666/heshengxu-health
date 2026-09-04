<template>
  <view v-if="visible" class="scrim" @tap="$emit('close')">
    <view class="sheet" @tap.stop>
      <view class="sheet-head"><view><text class="sheet-title">写下一个新计划</text><text class="sheet-note">不用完美，先从今天开始</text></view><button class="close" aria-label="关闭" @tap="$emit('close')">×</button></view>
      <text class="label">计划名称</text><input v-model="title" class="input" maxlength="18" placeholder="例如：每天晒太阳" />
      <text class="label">给自己的话（可选）</text><input v-model="subtitle" class="input" maxlength="30" placeholder="例如：让身体感受一点光" />
      <text class="label">属于哪个方向</text>
      <view class="categories"><button v-for="item in categories" :key="item.value" :class="{ selected: category === item.value }" @tap="category = item.value">{{ item.label }}</button></view>
      <text class="label">频率</text><view class="frequencies"><button v-for="item in frequencies" :key="item" :class="{ selected: frequency === item }" @tap="frequency = item">{{ item }}</button></view>
      <button class="submit" :disabled="!title.trim()" @tap="submit">创建我的计划</button>
    </view>
  </view>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import type { PlanCategory } from '../../features/plans/plan-types.js';
defineProps<{ visible: boolean }>();
const emit = defineEmits<{ close: []; create: [input: { title: string; subtitle: string; category: PlanCategory; frequency: string }] }>();
const title = ref(''); const subtitle = ref(''); const category = ref<PlanCategory>('custom'); const frequency = ref('每天');
const categories: Array<{ value: PlanCategory; label: string }> = [
  { value: 'food', label: '饮食' }, { value: 'exercise', label: '运动' }, { value: 'study', label: '学习' }, { value: 'sleep', label: '睡眠' }, { value: 'mood', label: '心情' }, { value: 'custom', label: '其他' },
];
const frequencies = ['每天', '每周 3 天', '每周 5 天'];
function submit() { if (!title.value.trim()) return; emit('create', { title: title.value.trim(), subtitle: subtitle.value.trim(), category: category.value, frequency: frequency.value }); title.value = ''; subtitle.value = ''; }
</script>
<style scoped>
.scrim { position:fixed; inset:0; z-index:120; display:flex; align-items:flex-end; background:rgba(39,67,50,.22); }
.sheet { width:100%; padding:26rpx 28rpx calc(26rpx + env(safe-area-inset-bottom)); border-radius:26rpx 26rpx 0 0; background:#ffffff; box-shadow:0 -12rpx 36rpx rgba(54,83,67,.16); }
.sheet-head { display:flex; align-items:flex-start; justify-content:space-between; }
.sheet-title { display:block; color:#365343; font-size:32rpx; font-weight:700; }
.sheet-note { display:block; margin-top:6rpx; color:#84988c; font-size:20rpx; }
.close { width:48rpx; height:48rpx; color:#78907f; font-size:40rpx; line-height:44rpx; }
.label { display:block; margin:20rpx 0 9rpx; color:#4f6756; font-size:21rpx; }
.input { width:100%; height:78rpx; padding:0 18rpx; border:1rpx solid #dfe9df; border-radius:13rpx; color:#365343; font-size:24rpx; background:#fff; }
.categories,.frequencies { display:flex; flex-wrap:wrap; gap:10rpx; }
.categories button,.frequencies button { padding:12rpx 17rpx; border:1rpx solid #dfe9df; border-radius:999rpx; color:#78907f; font-size:20rpx; background:#fff; }
.categories button.selected,.frequencies button.selected { border-color:#9fc8a4; color:#4f8a61; background:#edf5e8; }
.submit { width:100%; height:82rpx; margin-top:26rpx; border-radius:14rpx; color:#fff; font-size:26rpx; background:#6f9f7a; box-shadow:0 8rpx 18rpx rgba(111,159,122,.2); }
.submit[disabled] { opacity:.45; }
</style>
