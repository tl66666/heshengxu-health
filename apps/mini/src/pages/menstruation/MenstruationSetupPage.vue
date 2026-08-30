<template>
  <view class="page">
    <AppNavBar title="生理期" route="/pages/menstruation/MenstruationSetupPage" />
    <view class="setup-header">
      <view class="step-line"><text class="step-dot active">1</text><view class="step-rule" /><text class="step-dot">2</text></view>
      <text class="kicker">建立你的周期档案</text>
      <text class="title">先从最近一次经期开始</text>
      <text class="subtitle">设置完成后，和生序才会为你计算周期日和下一次预计日期。</text>
    </view>

    <view class="paper">
      <view class="paper-art"><image src="/static/icons/watercolor/menstruation.jpg" mode="aspectFit" /></view>
      <view class="field-row">
        <view class="field"><text class="field-label">月经周期</text><view class="input-line"><input v-model="cycleLength" type="number" placeholder="28" /><text>天</text></view><text class="field-help">两次经期开始之间</text><text v-if="errors.cycleLength" class="error">{{ errors.cycleLength }}</text></view>
        <view class="field"><text class="field-label">经期天数</text><view class="input-line"><input v-model="periodLength" type="number" placeholder="5" /><text>天</text></view><text class="field-help">通常持续几天</text><text v-if="errors.periodLength" class="error">{{ errors.periodLength }}</text></view>
      </view>
      <view class="field field-full"><text class="field-label">最近一次经期开始</text><picker mode="date" :value="lastPeriodStart" :end="today" @change="lastPeriodStart = $event.detail.value"><view class="date-line"><text :class="{ placeholder: !lastPeriodStart }">{{ lastPeriodStart || '选择日期' }}</text><text class="chevron">›</text></view></picker><text class="field-help">可以向前翻找最近的一次</text><text v-if="errors.lastPeriodStart" class="error">{{ errors.lastPeriodStart }}</text></view>
      <view class="field field-full optional-field"><text class="field-label">经期结束日期 <text class="optional">选填</text></text><picker mode="date" :value="lastPeriodEnd" :start="lastPeriodStart || undefined" :end="today" @change="lastPeriodEnd = $event.detail.value"><view class="date-line"><text :class="{ placeholder: !lastPeriodEnd }">{{ lastPeriodEnd || '之后再补充' }}</text><text class="chevron">›</text></view></picker><text v-if="errors.lastPeriodEnd" class="error">{{ errors.lastPeriodEnd }}</text></view>
    </view>

    <view class="quiet-note"><text>周期会因压力、睡眠和身体状态变化，预测只作为生活记录参考。</text></view>
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
const input = computed(() => ({ cycleLength: cycleLength.value, periodLength: periodLength.value, lastPeriodStart: lastPeriodStart.value, lastPeriodEnd: lastPeriodEnd.value }));
const canSubmit = computed(() => Object.keys(validateCycleSetup(input.value)).length === 0);
function validate() { const next = validateCycleSetup(input.value); Object.keys(errors).forEach(key => delete errors[key]); Object.assign(errors, next); return !Object.keys(next).length; }
function submit() { if (!validate()) return; saveCycleSettings({ cycleLength: Number(cycleLength.value), periodLength: Number(periodLength.value), lastPeriodStart: lastPeriodStart.value, lastPeriodEnd: lastPeriodEnd.value || undefined, updatedAt: new Date().toISOString() }); uni.showToast({ title: '已保存', icon: 'success' }); setTimeout(() => uni.redirectTo({ url: '/pages/menstruation/MenstruationDetailPage' }), 220); }
</script>

<style scoped>
.page { min-height: 100vh; padding: 0 28rpx 58rpx; background: #fff7f1; color: #51484b; }
.setup-header { padding: 28rpx 4rpx 24rpx; }
.step-line { display: flex; align-items: center; width: 132rpx; margin-bottom: 26rpx; }
.step-dot { display: flex; align-items: center; justify-content: center; width: 28rpx; height: 28rpx; border: 1rpx solid #e7d3d4; border-radius: 50%; color: #b2a0a0; background: #fffdfb; font-size: 15rpx; }
.step-dot.active { border-color: #e49aa9; color: #fff; background: #e49aa9; }
.step-rule { width: 40rpx; height: 1rpx; margin: 0 8rpx; background: #ecdcdc; }
.kicker { display: block; color: #b26c82; font-size: 20rpx; }
.title { display: block; margin-top: 8rpx; color: #51454c; font-size: 34rpx; font-weight: 700; }
.subtitle { display: block; max-width: 650rpx; margin-top: 10rpx; color: #98898b; font-size: 21rpx; line-height: 1.55; }
.paper { padding: 24rpx; border: 1rpx solid #f0dfda; border-radius: 18rpx; background: #fffdfb; box-shadow: 0 10rpx 24rpx rgba(139, 102, 89, .07); }
.paper-art { display: flex; justify-content: center; height: 116rpx; margin: -4rpx 0 8rpx; }
.paper-art image { width: 150rpx; height: 116rpx; opacity: .8; mix-blend-mode: multiply; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 18rpx; }
.field { min-width: 0; }
.field-full { margin-top: 22rpx; padding-top: 20rpx; border-top: 1rpx solid #f3e7e2; }
.field-label { display: block; color: #6d5c62; font-size: 23rpx; font-weight: 700; }
.optional { color: #b3a4a3; font-size: 19rpx; font-weight: 400; }
.input-line, .date-line { display: flex; align-items: center; justify-content: space-between; height: 70rpx; margin-top: 10rpx; padding: 0 14rpx; border-bottom: 1rpx solid #e5d2d0; color: #9c898d; }
.input-line input { width: 100%; height: 100%; color: #5b4a51; font-size: 30rpx; font-weight: 700; }
.input-line text { font-size: 20rpx; }
.field-help { display: block; margin-top: 7rpx; color: #ad9e9d; font-size: 18rpx; }
.date-line { height: 64rpx; border: 1rpx solid #efdfda; border-radius: 12rpx; padding: 0 14rpx; color: #6d5c62; font-size: 22rpx; }
.date-line .placeholder { color: #b7a9a8; }
.chevron { color: #bd7d8d; font-size: 28rpx; }
.error { display: block; margin-top: 6rpx; color: #b85e43; font-size: 18rpx; }
.quiet-note { margin-top: 20rpx; padding: 0 4rpx; color: #a09191; font-size: 18rpx; line-height: 1.5; }
.primary-button { width: 100%; height: 82rpx; margin-top: 26rpx; border-radius: 40rpx; color: #fff; background: #e28da2; box-shadow: 0 10rpx 20rpx rgba(214, 123, 143, .2); font-size: 27rpx; line-height: 82rpx; }
.primary-button[disabled] { opacity: .42; }
@media (min-width: 700px) { .page { max-width: 760px; margin: 0 auto; } }
</style>
