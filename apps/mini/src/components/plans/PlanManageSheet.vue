<template>
  <view v-if="visible" class="scrim" @tap="$emit('close')">
    <view class="sheet" @tap.stop>
      <view class="sheet-head"><view><text class="sheet-title">管理计划</text><text class="sheet-note">调整成更适合现在的节奏</text></view><button class="close" aria-label="关闭" @tap="$emit('close')">×</button></view>
      <text class="label">选择计划</text>
      <scroll-view scroll-x class="plan-picker" show-scrollbar="false"><button v-for="plan in plans" :key="plan.id" :class="{ selected: plan.id === activeId }" @tap="activeId = plan.id">{{ plan.title }}</button></scroll-view>
      <template v-if="activePlan">
        <text class="label">计划名称</text><input v-model="title" class="input" maxlength="18" />
        <text class="label">给自己的话</text><input v-model="subtitle" class="input" maxlength="30" />
        <text class="label">添加一个小行动</text>
        <view class="add-task"><input v-model="taskTitle" class="input" maxlength="24" placeholder="例如：睡前拉伸 5 分钟" /><button class="add" :disabled="!taskTitle.trim()" @tap="addTask">添加</button></view>
        <view class="actions"><button class="save" @tap="save">保存修改</button><button class="archive" @tap="archive">归档这份计划</button></view>
      </template>
    </view>
  </view>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { HabitPlan } from '../../features/plans/plan-types.js';
const props = defineProps<{ visible: boolean; plans: HabitPlan[]; planId?: string }>();
const emit = defineEmits<{ close: []; save: [planId: string, patch: { title: string; subtitle: string }]; addTask: [planId: string, title: string]; archive: [planId: string] }>();
const activeId = ref(''); const title = ref(''); const subtitle = ref(''); const taskTitle = ref('');
const activePlan = computed(() => props.plans.find((plan) => plan.id === activeId.value));
watch(() => [props.visible, props.planId], () => { if (!props.visible) return; activeId.value = props.planId || props.plans[0]?.id || ''; title.value = activePlan.value?.title || ''; subtitle.value = activePlan.value?.subtitle || ''; taskTitle.value = ''; });
watch(activePlan, (plan) => { title.value = plan?.title || ''; subtitle.value = plan?.subtitle || ''; });
function save() { if (!activePlan.value || !title.value.trim()) return; emit('save', activePlan.value.id, { title: title.value.trim(), subtitle: subtitle.value.trim() }); }
function addTask() { if (!activePlan.value || !taskTitle.value.trim()) return; emit('addTask', activePlan.value.id, taskTitle.value.trim()); taskTitle.value = ''; }
function archive() {
  if (!activePlan.value) return;
  uni.showModal({ title: '归档这份计划？', content: '历史打卡会保留，但它不会再出现在进行中。', confirmText: '归档', success: (result) => { if (result.confirm) emit('archive', activePlan.value!.id); } });
}
</script>
<style scoped>
.scrim { position:fixed; inset:0; z-index:120; display:flex; align-items:flex-end; background:rgba(39,67,50,.22); }
.sheet { width:100%; max-height:88vh; overflow:auto; padding:26rpx 28rpx calc(26rpx + env(safe-area-inset-bottom)); border-radius:26rpx 26rpx 0 0; background:#ffffff; box-shadow:0 -12rpx 36rpx rgba(54,83,67,.16); }
.sheet-head { display:flex; align-items:flex-start; justify-content:space-between; }.sheet-title { display:block; color:#365343; font-size:32rpx; font-weight:700; }.sheet-note { display:block; margin-top:6rpx; color:#84988c; font-size:20rpx; }.close { width:48rpx; height:48rpx; color:#78907f; font-size:40rpx; line-height:44rpx; }.label { display:block; margin:20rpx 0 9rpx; color:#4f6756; font-size:21rpx; }
.plan-picker { width:100%; white-space:nowrap; }.plan-picker button { display:inline-block; margin-right:10rpx; padding:11rpx 16rpx; border:1rpx solid #dfe9df; border-radius:999rpx; color:#78907f; font-size:20rpx; background:#fff; }.plan-picker button.selected { border-color:#9fc8a4; color:#4f8a61; background:#edf5e8; }
.input { width:100%; height:78rpx; padding:0 18rpx; border:1rpx solid #dfe9df; border-radius:13rpx; color:#365343; font-size:24rpx; background:#fff; }.add-task { display:flex; align-items:center; gap:10rpx; }.add-task .input { flex:1; }.add { width:110rpx; height:78rpx; border-radius:13rpx; color:#4f8a61; font-size:21rpx; background:#edf5e8; }.add[disabled] { opacity:.45; }.actions { display:flex; gap:12rpx; margin-top:26rpx; }.save,.archive { flex:1; height:78rpx; border-radius:13rpx; font-size:23rpx; }.save { color:#fff; background:#6f9f7a; box-shadow:0 8rpx 18rpx rgba(111,159,122,.2); }.archive { color:#6f806f; background:#f3f6f1; }
</style>
