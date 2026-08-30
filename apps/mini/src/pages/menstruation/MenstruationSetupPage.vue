<template>
  <view class="page">
    <AppNavBar title="设置生理期" route="/pages/menstruation/MenstruationSetupPage" />
    <view class="intro hz-rise"><text class="eyebrow">先告诉和生序你的节律</text><text class="title">设置周期后，再开始记录</text><text class="copy">只需要一次基础设置，之后可以随时修改。没有设置前，不会显示预测日期。</text></view>
    <view class="form-card hz-rise hz-rise-1">
      <view class="field-block"><text class="label">月经周期</text><text class="caption">从一次经期开始到下一次开始的天数</text><view class="number-field"><input v-model="cycleLength" type="number" placeholder="例如 28" /><text>天</text></view><text v-if="errors.cycleLength" class="error">{{ errors.cycleLength }}</text></view>
      <view class="field-block"><text class="label">经期天数</text><text class="caption">通常是月经持续的天数</text><view class="number-field"><input v-model="periodLength" type="number" placeholder="例如 5" /><text>天</text></view><text v-if="errors.periodLength" class="error">{{ errors.periodLength }}</text></view>
      <view class="field-block"><text class="label">最近一次经期开始</text><text class="caption">用于计算当前周期和下一次预测</text><picker mode="date" :value="lastPeriodStart" :end="today" @change="lastPeriodStart = $event.detail.value"><view class="date-field">{{ lastPeriodStart || '选择日期' }}<text>›</text></view></picker><text v-if="errors.lastPeriodStart" class="error">{{ errors.lastPeriodStart }}</text></view>
      <view class="field-block"><text class="label">最近一次经期结束 <text class="optional">选填</text></text><picker mode="date" :value="lastPeriodEnd" :start="lastPeriodStart || undefined" :end="today" @change="lastPeriodEnd = $event.detail.value"><view class="date-field">{{ lastPeriodEnd || '之后再补充也可以' }}<text>›</text></view></picker></view>
    </view>
    <view class="note"><text class="note-title">记录边界</text><text>和生序只帮你整理生活记录，不做疾病判断、备孕结论或用药建议。</text></view>
    <button class="primary-button" :disabled="!canSubmit" @tap="submit">保存并开始记录</button>
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import AppNavBar from '../../components/AppNavBar.vue';
import { saveCycleSettings } from '../../features/menstruation/menstruation.service.js';
import { validateCycleSetup } from './menstruation-setup.js';

const today = new Date().toISOString().slice(0, 10);
const cycleLength = ref('');
const periodLength = ref('');
const lastPeriodStart = ref('');
const lastPeriodEnd = ref('');
const errors = reactive<Record<string, string>>({});
const canSubmit = computed(() => Object.keys(validateCycleSetup({ cycleLength: cycleLength.value, periodLength: periodLength.value, lastPeriodStart: lastPeriodStart.value, lastPeriodEnd: lastPeriodEnd.value })).length === 0);

function validate(showErrors = true) {
  const next = validateCycleSetup({ cycleLength: cycleLength.value, periodLength: periodLength.value, lastPeriodStart: lastPeriodStart.value, lastPeriodEnd: lastPeriodEnd.value });
  if (showErrors) { Object.keys(errors).forEach(key => delete errors[key]); Object.assign(errors, next); }
  return Object.keys(next).length === 0;
}
function submit() {
  if (!validate(true)) return;
  saveCycleSettings({ cycleLength: Number(cycleLength.value), periodLength: Number(periodLength.value), lastPeriodStart: lastPeriodStart.value, lastPeriodEnd: lastPeriodEnd.value || undefined, updatedAt: new Date().toISOString() });
  uni.showToast({ title: '设置已保存', icon: 'success' });
  setTimeout(() => uni.redirectTo({ url: '/pages/menstruation/MenstruationDetailPage' }), 250);
}
</script>

<style scoped>
.page{min-height:100vh;padding:0 32rpx 56rpx;background:linear-gradient(180deg,#fff5fa 0%,#f7fbf8 52%);color:#29453a}.intro{padding:28rpx 4rpx 22rpx}.eyebrow{display:block;color:#ba7898;font-size:21rpx}.title{display:block;margin-top:10rpx;color:#48394b;font-size:34rpx;font-weight:700}.copy{display:block;margin-top:10rpx;color:#87958d;font-size:21rpx;line-height:1.55}.form-card{padding:24rpx;border:1rpx solid #ecdde5;border-radius:22rpx;background:rgba(255,255,255,.92);box-shadow:0 10rpx 24rpx rgba(214,152,185,.09)}.field-block+.field-block{margin-top:24rpx}.label{display:block;color:#40564c;font-size:24rpx;font-weight:700}.caption{display:block;margin-top:5rpx;color:#8c9b92;font-size:19rpx}.number-field,.date-field{display:flex;align-items:center;justify-content:space-between;height:76rpx;margin-top:12rpx;padding:0 16rpx;border:1rpx solid #e2ebe5;border-radius:14rpx;background:#fbfdfb;color:#688076;font-size:22rpx}.number-field input{flex:1;height:100%;color:#375348;font-size:25rpx}.number-field text{color:#8b9b92}.date-field{color:#6a8077}.date-field text{font-size:28rpx;color:#b67a98}.optional{font-weight:400;color:#a0aaa4}.error{display:block;margin-top:6rpx;color:#b85e43;font-size:19rpx}.note{margin-top:20rpx;padding:16rpx 18rpx;border-left:5rpx solid #e6adca;border-radius:0 14rpx 14rpx 0;background:#fff3f8;color:#8e7d87;font-size:19rpx;line-height:1.5}.note-title{display:block;margin-bottom:5rpx;color:#a66183;font-size:21rpx;font-weight:700}.primary-button{width:100%;height:84rpx;margin-top:28rpx;border-radius:18rpx;color:#fff;background:linear-gradient(135deg,#ef91b4,#d982ab);font-size:28rpx;line-height:84rpx}.primary-button[disabled]{opacity:.45}
</style>
