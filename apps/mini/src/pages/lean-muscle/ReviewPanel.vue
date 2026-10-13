<template>
  <view class="panel review-panel">
    <view class="section-top"
      ><text class="section-title">本周复盘</text><text class="pill">留下一点自己的发现</text></view
    >
    <text class="muted">分数只是线索。写下一条观察，选择下周一个行动。</text>
    <text class="field-label">这周我观察到</text
    ><textarea
      v-model="observation"
      maxlength="200"
      placeholder="例如：提前留出时间后，更容易完成训练"
    />
    <text class="field-label">下周我准备</text
    ><textarea v-model="action" maxlength="200" placeholder="例如：保留周一和周四的训练时间" />
    <text v-if="error" class="error">{{ error }}</text
    ><button class="secondary" style="margin-top: 22rpx" @tap="save">保存本周复盘</button>
  </view>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue';
import { loadJournal, saveReview } from '../../features/lean-muscle/store.js';
import { weekDates } from '../../features/lean-muscle/calendar.js';
const props = defineProps<{ date: string }>();
const emit = defineEmits<{ changed: [] }>();
const observation = ref('');
const action = ref('');
const error = ref('');
watch(
  () => props.date,
  () => {
    const value = loadJournal().reviews[weekDates(props.date)[0]!];
    observation.value = value?.observation || '';
    action.value = value?.action || '';
    error.value = '';
  },
  { immediate: true },
);
function save() {
  try {
    saveReview(props.date, observation.value, action.value);
    error.value = '';
    emit('changed');
    uni.showToast({ title: '复盘已保存', icon: 'success' });
  } catch (e) {
    error.value = e instanceof Error ? e.message : '保存失败';
  }
}
</script>
