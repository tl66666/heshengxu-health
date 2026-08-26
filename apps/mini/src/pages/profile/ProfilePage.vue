<template>
  <view class="page">
    <AppNavBar title="健康档案" route="/pages/profile/ProfilePage" />
    <view v-if="loading" class="state">正在整理你的档案…</view>
    <view v-else>
      <view class="identity">
        <image class="avatar" src="/static/illustrations/xuxu-avatar.jpg" mode="aspectFill" />
        <view class="identity-copy"><text class="name">{{ profile.displayName || '健康管理者' }}</text><text class="sub">你的信息只用于生成更合适的健康管理参考</text></view>
      </view>
      <view class="progress"><view class="progress-head"><text>档案完成度</text><text>{{ completion }}%</text></view><view class="track"><view class="fill" :style="{ width: `${completion}%` }" /></view></view>
      <view class="metric-grid"><view><text>{{ profile.heightCm || '--' }}</text><text>身高 cm</text></view><view><text>{{ profile.weightKg || '--' }}</text><text>体重 kg</text></view><view><text>{{ bmi === null ? '--' : bmi.toFixed(1) }}</text><text>BMI 参考</text></view></view>
      <view class="section"><text class="section-title">档案信息</text><button class="row" @tap="edit('basic')"><view class="row-icon"><image src="/static/icons/profile.svg" mode="aspectFit" /></view><view class="row-copy"><text>基础资料</text><text>{{ sexLabel }} · {{ profile.displayName || '未填写昵称' }}</text></view><image class="arrow" src="/static/icons/forward.svg" mode="aspectFit" /></button><button class="row" @tap="edit('body')"><view class="row-icon"><image src="/static/icons/journal.svg" mode="aspectFit" /></view><view class="row-copy"><text>身体指标</text><text>{{ bodySummary }}</text></view><image class="arrow" src="/static/icons/forward.svg" mode="aspectFit" /></button><button class="row" @tap="edit('goal')"><view class="row-icon"><image src="/static/icons/plan.svg" mode="aspectFit" /></view><view class="row-copy"><text>健康目标</text><text>{{ goalLabel }}</text></view><image class="arrow" src="/static/icons/forward.svg" mode="aspectFit" /></button></view>
      <view class="notice"><image src="/static/illustrations/xuxu-safe-support.png" mode="aspectFit" /><view><text>序序会尊重你的节奏</text><text>档案可以随时调整，不需要一次填完所有答案。</text></view></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import AppNavBar from '../../components/AppNavBar.vue';
import { calculateBmi } from '../../../../../packages/domain/src/bmi.js';
import { loadHealthProfile } from '../../features/health-profile/health-profile.service.js';
import { goalLabels, sexLabels, type HealthProfile } from '../../features/health-profile/health-profile.types.js';

const loading = ref(true);
const profile = ref<HealthProfile>({ userId: '', displayName: null, birthDate: null, sex: 'unspecified', heightCm: null, weightKg: null, primaryGoal: null });
const bmi = computed(() => profile.value.heightCm && profile.value.weightKg ? calculateBmi(profile.value.heightCm, profile.value.weightKg) : null);
const completion = computed(() => Math.round(([profile.value.displayName, profile.value.sex !== 'unspecified', profile.value.heightCm, profile.value.weightKg, profile.value.primaryGoal].filter(Boolean).length / 5) * 100));
const sexLabel = computed(() => sexLabels[profile.value.sex]);
const goalLabel = computed(() => profile.value.primaryGoal ? goalLabels[profile.value.primaryGoal] : '还没有设置目标');
const bodySummary = computed(() => profile.value.heightCm && profile.value.weightKg ? `${profile.value.heightCm} cm · ${profile.value.weightKg} kg` : '补充身高和体重，查看 BMI 参考');
function edit(section: string) { uni.navigateTo({ url: `/pages/profile-edit/ProfileEditPage?section=${section}` }); }
async function load() { loading.value = true; try { profile.value = await loadHealthProfile(); } catch { uni.showToast({ title: '档案暂时无法加载', icon: 'none' }); } finally { loading.value = false; } }
onShow(load);
</script>

<style scoped>
.page{min-height:100vh;box-sizing:border-box;padding:28rpx 32rpx 70rpx;background:#f7fbf8;color:#244735}.identity{display:flex;align-items:center;padding:10rpx 0 22rpx}.avatar{width:88rpx;height:88rpx;border:3rpx solid #efd98d;border-radius:28rpx}.identity-copy{flex:1;margin-left:18rpx}.name{display:block;color:#244735;font-size:32rpx;font-weight:700}.sub{display:block;margin-top:7rpx;color:#829689;font-size:20rpx;line-height:1.45}.progress{padding:18rpx 20rpx;border:1rpx solid #dceadd;border-radius:18rpx;background:#fff}.progress-head{display:flex;justify-content:space-between;color:#557463;font-size:22rpx}.progress-head text:last-child{color:#2e7d4f;font-weight:700}.track{height:10rpx;margin-top:12rpx;border-radius:10rpx;background:#e5efe6;overflow:hidden}.fill{height:100%;border-radius:inherit;background:#68a878}.metric-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10rpx;margin-top:16rpx}.metric-grid view{padding:16rpx 6rpx;text-align:center;border-radius:16rpx;background:#eaf4ea}.metric-grid text{display:block}.metric-grid text:first-child{color:#2e7149;font-size:30rpx;font-weight:700}.metric-grid text:last-child{margin-top:5rpx;color:#7d9585;font-size:18rpx}.section{margin-top:28rpx}.section-title{display:block;margin:0 2rpx 10rpx;color:#5f806b;font-size:22rpx;font-weight:700}.row{display:flex;align-items:center;width:100%;min-height:94rpx;padding:14rpx 2rpx;border-bottom:1rpx solid #e1ebe2;text-align:left;background:transparent}.row-icon{display:flex;align-items:center;justify-content:center;width:48rpx;height:48rpx;margin-right:14rpx;border-radius:16rpx;background:#edf6ee}.row-icon image{width:30rpx;height:30rpx;opacity:.72}.row-copy{flex:1;min-width:0}.row-copy text{display:block}.row-copy text:first-child{color:#31543e;font-size:26rpx;font-weight:700}.row-copy text:last-child{margin-top:5rpx;color:#819586;font-size:20rpx}.arrow{width:30rpx;height:30rpx;opacity:.62}.notice{display:flex;align-items:center;gap:12rpx;margin-top:30rpx;padding:14rpx 16rpx;border:1rpx solid #dceadd;border-radius:16rpx;background:#f1f8f1}.notice image{width:52rpx;height:52rpx;flex:none}.notice text{display:block}.notice text:first-child{color:#4f735b;font-size:21rpx;font-weight:700}.notice text:last-child{margin-top:4rpx;color:#819486;font-size:18rpx;line-height:1.4}.state{padding:180rpx 20rpx;color:#70897a;text-align:center;font-size:24rpx}
</style>
