<template>
  <view class="panel evidence-panel">
    <view class="section-top"
      ><text class="section-title">补齐一天的记录</text
      ><picker mode="date" :value="date" :end="today" @change="emit('date', $event.detail.value)"
        ><text class="header-link">{{ date.slice(5) }}　⌄</text></picker
      ></view
    >
    <text class="muted">没有记录与没有完成，是两件不同的事。只确认真实情况。</text>
    <view class="divider" />
    <text class="field-label">这一天的活动</text>
    <text v-if="trained" class="pill">已保存力量训练，自动计入</text>
    <view v-else class="selection-grid"
      ><button
        :class="{ chosen: evidence.activity === 'rest' }"
        @tap="save({ activity: 'rest', recovered: true })"
      >
        按安排休息</button
      ><button
        :class="{ chosen: evidence.activity === 'missed' }"
        @tap="save({ activity: 'missed', recovered: false })"
      >
        今天未完成
      </button></view
    >
    <text v-if="trained" class="note">今天已有力量记录，不再确认成恢复日。</text>
    <view class="divider" />
    <view class="row spread"
      ><text>饮食记录</text
      ><button
        class="quiet-button"
        @tap="navigateTo(`/pages/food-summary/FoodSummaryPage?date=${date}`)"
      >
        去记录 →
      </button></view
    >
    <text class="muted"
      >{{
        signal?.foodError
          ? '完整餐次暂不可用，保持待记录'
          : signal?.proteinG === undefined
            ? '正在读取餐次'
            : `已记录蛋白 ${signal.proteinG.toFixed(1)} g`
      }}
      · {{ confirmed ? '全天已确认' : '尚未确认完整' }}</text
    >
    <text class="note"
      >主要餐次包含主食、蛋白来源、蔬菜或水果时，计为结构完整。确认前请检查当天餐次与份量。</text
    >
    <view class="two-columns"
      ><view
        ><text class="field-label">主要餐次</text
        ><input v-model="mainMeals" type="number" placeholder="如 3" /></view
      ><view
        ><text class="field-label">结构完整餐次</text
        ><input v-model="balancedMeals" type="number" placeholder="如 2" /></view
    ></view>
    <button
      class="secondary"
      style="margin-top: 18rpx"
      :disabled="loading || signal?.proteinG === undefined || signal?.foodValid === false"
      @tap="confirmFood"
    >
      {{ loading ? '餐次读取中…' : '确认这一天已记完整' }}
    </button>
    <text v-if="signal?.foodValid === false || signal?.foodError" class="note"
      >部分营养数据暂不可用，先核对饮食记录，再确认。</text
    >
    <view class="divider" />
    <view class="row spread"
      ><view
        ><text>睡眠</text
        ><text class="muted">{{
          signal?.sleepMinutes === undefined
            ? '还没有记录昨夜睡眠'
            : `${(signal.sleepMinutes / 60).toFixed(1)} 小时，已自动读取`
        }}</text></view
      ><button class="quiet-button" @tap="navigateTo('/pages/sleep/SleepDetailPage')">
        去记录 →
      </button></view
    >
    <text v-if="error" class="error">{{ error }}</text>
  </view>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { loadJournal, saveEvidence } from '../../features/lean-muscle/store.js';
import { shanghaiDate } from '../../features/lean-muscle/calendar.js';
import type { DailyEvidence, DaySignal } from '../../features/lean-muscle/types.js';
import { navigateTo } from '../../utils/router.js';
const props = defineProps<{ date: string; signal?: DaySignal; loading: boolean }>();
const emit = defineEmits<{ changed: []; date: [value: string] }>();
const today = shanghaiDate();
const error = ref('');
const evidence = ref<DailyEvidence>({});
const trained = ref(false);
const mainMeals = ref('3');
const balancedMeals = ref('0');
function refresh() {
  const journal = loadJournal();
  evidence.value = journal.evidence[props.date] || {};
  trained.value = journal.sessions.some((s) => s.date === props.date);
  mainMeals.value = String(evidence.value.mainMeals ?? props.signal?.mealCount ?? 3);
  balancedMeals.value = String(evidence.value.balancedMeals ?? 0);
}
watch(() => [props.date, props.signal], refresh, { immediate: true });
const confirmed = computed(
  () =>
    evidence.value.foodComplete && evidence.value.foodFingerprint === props.signal?.foodFingerprint,
);
function save(patch: DailyEvidence) {
  try {
    saveEvidence(props.date, patch);
    error.value = '';
    refresh();
    emit('changed');
    uni.showToast({ title: '已确认', icon: 'success' });
  } catch (e) {
    error.value = e instanceof Error ? e.message : '保存失败，请重试';
  }
}
function confirmFood() {
  if (!props.signal?.foodFingerprint || props.signal.foodValid === false || props.loading) return;
  save({
    foodComplete: true,
    foodFingerprint: props.signal.foodFingerprint,
    mainMeals: Number(mainMeals.value),
    balancedMeals: Number(balancedMeals.value),
  });
}
</script>
