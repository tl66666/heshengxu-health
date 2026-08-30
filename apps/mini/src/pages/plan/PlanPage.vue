<template>
  <view class="page">
    <image class="leaf" src="/static/illustrations/leaf-corner-decoration.png" mode="aspectFit" />
    <view class="topbar"><view><text class="top-eyebrow">HEBAN · 我的计划</text><text class="top-title">计划</text></view><button class="history" @tap="showToast('历史记录会在这里慢慢长出来')">历史</button></view>

    <PlanHero :completed="habitCompleted" :streak="habitStreak" />

    <view v-if="apiPlan" class="api-plan"><view><text class="api-title">健康计划</text><text class="api-note">{{ apiPlan.kind === 'sleep' ? '睡眠与精力' : '体重管理' }} · 来自健康档案</text></view><button @tap="openSetup">调整</button></view>

    <PlanTaskList :plans="plans" @toggle="toggleTask" />
    <PlanTemplateGrid @select="addTemplate" @custom="sheetVisible = true" />

    <PlanCreateSheet :visible="sheetVisible" @close="sheetVisible = false" @create="createCustom" />
    <MiniTabBar active="plan" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import MiniTabBar from '../../components/MiniTabBar.vue';
import PlanHero from '../../components/plans/PlanHero.vue';
import PlanTaskList from '../../components/plans/PlanTaskList.vue';
import PlanTemplateGrid from '../../components/plans/PlanTemplateGrid.vue';
import PlanCreateSheet from '../../components/plans/PlanCreateSheet.vue';
import { healthLoopState } from '../../features/health-loop/health-loop.store.js';
import { addCustomPlan, addTemplatePlan, loadHabitPlans, planStats, streakFor, toggleHabitTask } from '../../features/plans/plan-store.js';
import type { HabitPlan, PlanTemplate } from '../../features/plans/plan-types.js';

const plans = ref<HabitPlan[]>([]);
const sheetVisible = ref(false);
const apiPlan = computed(() => healthLoopState.today.value?.activePlan || healthLoopState.plan.value);
const habitCompleted = computed(() => plans.value.reduce((sum, plan) => sum + planStats(plan).completed, 0));
const habitStreak = computed(() => plans.value.length ? Math.max(...plans.value.map(streakFor)) : 0);

function refresh() { plans.value = loadHabitPlans(); healthLoopState.loadToday(localDate()); }
function toggleTask(planId: string, taskId: string) { toggleHabitTask(planId, taskId); plans.value = loadHabitPlans(); }
function addTemplate(template: PlanTemplate) {
  const result = addTemplatePlan(template); plans.value = result.plans;
  uni.showToast({ title: result.added ? '已加入你的计划' : '这个计划已经在进行中', icon: 'none' });
}
function createCustom(input: Parameters<typeof addCustomPlan>[0]) { addCustomPlan(input); plans.value = loadHabitPlans(); sheetVisible.value = false; uni.showToast({ title: '新计划已创建', icon: 'none' }); }
function openSetup() { uni.navigateTo({ url: '/pages/plan-setup/PlanSetupPage' }); }
function showToast(title: string) { uni.showToast({ title, icon: 'none' }); }
function localDate() { const now = new Date(); return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10); }
onShow(refresh);
</script>

<style scoped>
.page { position:relative; min-height:100vh; overflow:hidden; padding:30rpx 28rpx calc(var(--hz-tabbar-height) + env(safe-area-inset-bottom) + 34rpx); color:#5d4f53; background:#fff7f1; }
.leaf { position:absolute; top:-52rpx; right:-76rpx; z-index:0; width:260rpx; height:260rpx; opacity:.17; transform:rotate(10deg); pointer-events:none; }
.topbar { position:relative; z-index:1; display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:20rpx; }
.top-eyebrow { display:block; color:#b17b72; font-size:19rpx; letter-spacing:1rpx; }
.top-title { display:block; margin-top:5rpx; color:#5b4d52; font-size:41rpx; font-weight:700; }
.history { padding:10rpx 0 8rpx 18rpx; color:#ae7a75; font-size:21rpx; }
.api-plan { display:flex; align-items:center; justify-content:space-between; margin-top:18rpx; padding:18rpx 20rpx; border:1rpx solid #e7ddd6; border-radius:16rpx; background:#fbf4ea; }
.api-title { display:block; color:#715b5d; font-size:24rpx; font-weight:700; }
.api-note { display:block; margin-top:4rpx; color:#a58f8d; font-size:19rpx; }
.api-plan button { padding:10rpx 16rpx; border-radius:999rpx; color:#a86770; font-size:20rpx; background:#fff0f1; }
</style>
