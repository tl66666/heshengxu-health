<template>
  <view class="lean-page">
    <AppNavBar title="我的薄肌安排" route="/pages/lean-muscle/SettingsPage" />
    <view class="hero"
      ><text class="eyebrow">MAKE IT YOURS</text><text class="hero-title">安排得下，才走得远。</text
      ><text class="hero-copy">选择适合自己的时间、场地和目标。</text><LeanArt class="hero-art"
    /></view>
    <view v-if="underage !== false" class="panel"
      ><text class="section-title">{{
        underage === null ? '先确认健康档案' : '先记录活动与感受'
      }}</text
      ><text class="muted">{{
        underage === null
          ? '确认年龄后再建立成人养成目标。档案暂不可用时，仍可记录活动与阅读指南。'
          : '当前养成评分与营养目标面向成年人。你可以继续使用活动记录和阅读指南，训练安排结合年龄与专业指导。'
      }}</text
      ><button class="secondary" @tap="navigateTo('/pages/profile/ProfilePage')">
        查看健康档案</button
      ><button class="quiet-button" @tap="navigateTo('/pages/lean-muscle/TrainingPage')">
        记录一次活动 →
      </button></view
    >
    <template v-else>
      <view class="panel">
        <text class="section-title">方向与场地</text><text class="field-label">当前方向</text
        ><view class="selection-grid"
          ><button
            v-for="d in directions"
            :key="d.id"
            :class="{ chosen: draft.direction === d.id }"
            @tap="draft.direction = d.id"
          >
            {{ d.label }}
          </button></view
        >
        <text class="field-label">训练场地</text
        ><view class="selection-grid"
          ><button :class="{ chosen: draft.location === 'home' }" @tap="draft.location = 'home'">
            居家</button
          ><button :class="{ chosen: draft.location === 'gym' }" @tap="draft.location = 'gym'">
            健身房
          </button></view
        >
        <text class="field-label">训练经验</text
        ><view class="selection-grid"
          ><button
            :class="{ chosen: draft.experience === 'beginner' }"
            @tap="draft.experience = 'beginner'"
          >
            从入门开始</button
          ><button
            :class="{ chosen: draft.experience === 'experienced' }"
            @tap="draft.experience = 'experienced'"
          >
            已有训练习惯
          </button></view
        >
        <text class="field-label">每周训练日</text
        ><view class="selection-grid"
          ><button
            v-for="(day, i) in weekdays"
            :key="day"
            :class="{ chosen: draft.trainingDays.includes(i + 1) }"
            @tap="toggleDay(i + 1)"
          >
            {{ day }}
          </button></view
        ><text class="note">从能够坚持的安排开始，留出恢复日。</text>
        <text class="field-label">每次预计时长 / 分钟</text
        ><input v-model="duration" type="number" placeholder="20" />
      </view>
      <view class="panel"
        ><text class="section-title">饮食与恢复目标</text
        ><text class="field-label">个人蛋白目标 / g · 选填</text
        ><input v-model="protein" type="digit" placeholder="已有适合自己的目标时填写" /><text
          class="note"
          >采用你已确认适用的个人目标，留空时该分项显示待设置。体重管理目标和热量安排不会因此改变。</text
        ><text class="field-label">睡眠目标 / 小时</text
        ><input v-model="sleepHours" type="digit" placeholder="8" /><text class="note"
          >结合年龄与实际感受确认，达到目标后不再因睡得更久加分。</text
        ></view
      >
      <view class="panel"
        ><text class="section-title">我的代表动作</text
        ><text class="muted">选择同一动作、变式、器械与负重，比较实际第一组。</text
        ><text class="field-label">代表动作</text
        ><picker
          :range="exerciseOptions.map((e) => e.name)"
          :value="representativeIndex"
          @change="draft.representativeId = exerciseOptions[Number($event.detail.value)]!.id"
          ><view class="picker">{{ exerciseName(draft.representativeId) }}　⌄</view></picker
        ><view class="two-columns"
          ><view
            ><text class="field-label">第一组目标次数</text
            ><input v-model="representativeReps" type="number" placeholder="8" /></view
          ><view
            ><text class="field-label">比较负重 / kg</text
            ><input v-model="representativeLoad" type="digit" placeholder="自重填 0" /></view></view
        ><text class="note">可以选择维持现有能力，不必每周增加重量。</text></view
      >
      <view class="panel"
        ><text class="section-title">生效时间</text
        ><text class="muted">{{ effectiveDate }} 这一周开始</text
        ><text class="note">{{
          existing
            ? '本周目标已经建立，调整从下一周生效，保持历史分数可比较。'
            : '首次建立后，本周即可开始记录。'
        }}</text></view
      >
      <text v-if="error" class="error">{{ error }}</text
      ><button class="primary" @tap="save">
        {{ existing ? '保存下一周安排' : '建立我的安排' }}
      </button>
    </template>
  </view>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import AppNavBar from '../../components/AppNavBar.vue';
import LeanArt from './LeanArt.vue';
import { loadJournal, getWeekPlan, savePlan } from '../../features/lean-muscle/store.js';
import {
  DEFAULT_PLAN,
  exerciseOptions,
  exerciseName,
} from '../../features/lean-muscle/training.js';
import { shanghaiDate, shiftDate, weekDates } from '../../features/lean-muscle/calendar.js';
import {
  localUnderageProfile,
  resolveUnderageProfile,
} from '../../features/lean-muscle/eligibility.js';
import type { LeanPlan } from '../../features/lean-muscle/types.js';
import { navigateBack, navigateTo } from '../../utils/router.js';
const today = shanghaiDate();
const journal = loadJournal();
const existing = getWeekPlan(journal, today);
const effectiveDate = existing ? shiftDate(weekDates(today)[0]!, 7) : today;
const planned = journal.plans[weekDates(effectiveDate)[0]!] || existing || DEFAULT_PLAN;
const draft = ref<LeanPlan>(JSON.parse(JSON.stringify(planned)));
const duration = ref(String(draft.value.durationMinutes));
const protein = ref(draft.value.proteinG === null ? '' : String(draft.value.proteinG));
const sleepHours = ref(String(draft.value.sleepMinutes / 60));
const representativeReps = ref(String(draft.value.representativeReps));
const representativeLoad = ref(String(draft.value.representativeLoadKg));
const error = ref('');
const directions = [
  { id: 'strength' as const, label: '增强力量' },
  { id: 'recompose' as const, label: '减脂兼顾力量' },
  { id: 'maintain' as const, label: '保持状态' },
];
const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const representativeIndex = computed(() =>
  exerciseOptions.findIndex((e) => e.id === draft.value.representativeId),
);
const underage = ref<boolean | null>(localUnderageProfile());
let eligibilityRequest = 0;
onShow(async () => {
  const request = ++eligibilityRequest;
  underage.value = localUnderageProfile();
  const result = await resolveUnderageProfile();
  if (request === eligibilityRequest) underage.value = result;
});
function toggleDay(day: number) {
  draft.value.trainingDays = draft.value.trainingDays.includes(day)
    ? draft.value.trainingDays.filter((d) => d !== day)
    : [...draft.value.trainingDays, day].sort();
}
function save() {
  try {
    if (underage.value !== false) throw new Error('请先确认适用的健康档案');
    savePlan(
      {
        ...draft.value,
        durationMinutes: Number(duration.value),
        proteinG: String(protein.value).trim() ? Number(protein.value) : null,
        sleepMinutes: Math.round(Number(sleepHours.value) * 60),
        representativeReps: Number(representativeReps.value),
        representativeLoadKg: Number(representativeLoad.value),
      },
      effectiveDate,
    );
    uni.showToast({ title: '安排已保存', icon: 'success' });
    navigateBack();
  } catch (e) {
    error.value = e instanceof Error ? e.message : '保存失败，请重试';
  }
}
</script>
