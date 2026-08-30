<template>
  <view class="section">
    <view class="section-head"><view><text class="section-title">发现更多计划</text><text class="section-note">挑一个现在最想照顾的方向</text></view><text class="count">{{ templates.length }} 个灵感</text></view>
    <scroll-view scroll-x class="template-scroll" show-scrollbar="false">
      <button v-for="template in templates" :key="template.title" class="template" :style="{ '--tint': template.tint }" @tap="$emit('select', template)">
        <image :src="template.icon" mode="aspectFit" /><text class="template-title">{{ template.title }}</text><text class="template-note">{{ template.frequency }}</text><text class="add-label">加入计划 ＋</text>
      </button>
      <button class="template custom" @tap="$emit('custom')"><text class="custom-plus">＋</text><text class="template-title">自定义计划</text><text class="template-note">写下自己的节奏</text></button>
    </scroll-view>
  </view>
</template>
<script setup lang="ts">
import type { PlanTemplate } from '../../features/plans/plan-types.js';
import { PLAN_TEMPLATES as templates } from '../../features/plans/plan-store.js';
defineEmits<{ select: [template: PlanTemplate]; custom: [] }>();
</script>
<style scoped>
.section { margin-top:34rpx; }
.section-head { display:flex; align-items:flex-end; justify-content:space-between; margin:0 2rpx 14rpx; }
.section-title { display:block; color:#5d4f53; font-size:30rpx; font-weight:700; }
.section-note { display:block; margin-top:5rpx; color:#9b888d; font-size:20rpx; }
.count { color:#b66d80; font-size:20rpx; }
.template-scroll { width:calc(100% + 32rpx); margin-left:-16rpx; white-space:nowrap; }
.template { display:inline-flex; flex-direction:column; vertical-align:top; width:210rpx; min-height:230rpx; margin:0 7rpx; padding:16rpx; border:1rpx solid #efe2dc; border-radius:18rpx; text-align:left; background:linear-gradient(155deg,var(--tint),#fffdfb 78%); }
.template:first-child { margin-left:16rpx; }
.template:last-child { margin-right:16rpx; }
.template image { width:88rpx; height:88rpx; margin-bottom:10rpx; }
.template-title { display:block; color:#62535a; font-size:24rpx; font-weight:700; }
.template-note { display:block; margin-top:5rpx; color:#9b898e; font-size:18rpx; }
.add-label { display:block; margin-top:auto; padding-top:13rpx; color:#b66d80; font-size:19rpx; }
.custom { align-items:center; justify-content:center; text-align:center; background:#fffdf8; }
.custom-plus { color:#c08a81; font-size:48rpx; line-height:1; }
.custom .template-title { margin-top:12rpx; }
</style>
