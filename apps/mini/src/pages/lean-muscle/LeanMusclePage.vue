<template>
  <view class="lean-page lean-hub-page">
    <AppNavBar title="薄肌养成" route="/pages/lean-muscle/LeanMusclePage" />
    <view class="hero journal-hero">
      <view class="hero-date-stamp"
        ><text>STRENGTH JOURNAL</text><text>每日一点，慢慢变强</text></view
      >
      <text class="hero-title">{{ '练一点，\n慢慢变强。' }}</text>
      <text class="hero-copy">训练 · 饮食 · 恢复</text>
      <image class="journal-scene" :src="leanVisualArt.scene" mode="aspectFit" />
      <view class="hero-bottom-note"><view /><text>你自己的身体养成手账</text></view>
    </view>
    <view class="tabs" aria-label="薄肌功能导航"
      ><button
        v-for="item in tabs"
        :key="item.id"
        :class="{ active: tab === item.id }"
        :aria-pressed="tab === item.id"
        @tap="tab = item.id"
      >
        {{ item.label }}
      </button></view
    >
    <text v-if="error" class="error">{{ error }}</text>
    <view :key="tab" class="journal-content"
      ><template v-if="tab === 'overview'">
        <view v-if="!plan" class="panel"
          ><text class="section-title">从适合你的安排开始</text
          ><text class="muted" style="margin: 16rpx 0 24rpx"
            >选择场地、训练日与个人目标。开始前先确认动作和难度适合自己。</text
          ><button class="primary" @tap="settings">建立我的安排</button></view
        >
        <view v-else class="panel today-card"
          ><view class="section-top"
            ><text class="section-title">{{ isTrainingDay ? '今日力量' : '今日恢复' }}</text
            ><button class="quiet-button" @tap="settings">调整目标 →</button></view
          ><text class="muted">{{
            todayScore.paused
              ? '这周已暂停评分，记录仍然保留。'
              : isTrainingDay
                ? `预计 ${plan.durationMinutes} 分钟 · 根据感受调整难度`
                : '留出恢复时间，日常轻活动也很好。'
          }}</text
          ><view class="today-exercises"
            ><text v-for="exercise in suggested" :key="exercise.id" class="pill">{{
              exercise.name
            }}</text></view
          ><button class="primary" @tap="recordTraining">
            {{ isTrainingDay ? '记录一次训练' : '自主记录力量训练' }}
          </button></view
        >
        <view class="panel hub-score-preview">
          <view class="section-top"
            ><text class="section-title">本周养成评分</text
            ><button class="quiet-button" @tap="tab = 'score'">查看评分 →</button></view
          >
          <view class="hub-score-line"
            ><text class="hub-score-value">{{
              underage !== false
                ? '待开启'
                : todayScore.paused || todayScore.coverage === 0
                  ? todayScore.label
                  : todayScore.total === null
                    ? `已确认 ${todayScore.lower} 分`
                    : `${todayScore.total} 分`
            }}</text
            ><text class="muted">{{
              underage === false
                ? '记录完整度 ' + todayScore.coverage + '%'
                : underage === null
                  ? '完善年龄信息后开启评分'
                  : '先关注活动与恢复'
            }}</text></view
          >
          <text class="note">训练、饮食、恢复与进步分别回看，只和自己比较。</text>
        </view>
        <view class="panel recommended-guide"
          ><view class="section-top"
            ><text class="section-title">薄肌圣经</text
            ><button class="quiet-button" @tap="tab = 'bible'">全部八章 →</button></view
          ><view class="row" @tap="openChapter(recommendedChapter.id)"
            ><LeanArt class="small-art" kind="bible" /><view
              ><text>{{ recommendedChapter.title }}</text
              ><text class="muted">{{ recommendedChapter.principle }}</text></view
            ></view
          ></view
        >
        <view class="panel progress-card"
          ><text class="section-title">看见自己的变化</text
          ><view class="link-row" @tap="navigateTo('/pages/weight/WeightDetailPage')"
            ><text>体重趋势与历史</text><text class="header-link">查看 →</text></view
          ><view class="link-row" @tap="tab = 'training'"
            ><text>代表动作与训练历史</text><text class="header-link">查看 →</text></view
          ><view class="link-row" @tap="navigateToXuxu()"
            ><text>和序序聊聊本周感受</text><text class="header-link">聊一聊 →</text></view
          ><button class="quiet-button" style="margin-top: 18rpx" @tap="pause">
            {{ todayScore.paused ? '恢复本周评分' : '身体不适或忙碌？设为恢复周' }}
          </button></view
        >
      </template>
      <template v-else-if="tab === 'score'">
        <view class="hub-section-intro"
          ><text class="section-title">回看这一周</text
          ><text class="muted">先看评分依据，再补齐真实记录。</text></view
        >
        <view class="week-control"
          ><button class="quiet-button" @tap="previousWeek">← 前一周</button
          ><text class="tiny">{{ score.week.slice(5) }} — {{ score.dates[6]!.slice(5) }}</text
          ><button class="quiet-button" :disabled="viewDate === today" @tap="currentWeek">
            本周 →
          </button></view
        >
        <ScorePanel v-if="underage === false" :score="score" />
        <view v-else class="panel"
          ><text class="section-title">{{
            underage === null ? '完善年龄后，开启评分' : '先关注活动与感受'
          }}</text
          ><text class="muted">养成评分面向成年人，训练和阅读都可以继续使用。</text
          ><button class="quiet-button" @tap="navigateTo('/pages/profile/ProfilePage')">
            完善档案 →
          </button></view
        >
        <view v-if="underage !== false" class="panel"
          ><text class="section-title">训练和阅读可以先开始</text
          ><text class="muted"
            >年龄信息只用于判断评分是否适用。你的训练日志与阅读进度仍可保存。</text
          ><button class="secondary" @tap="tab = 'training'">去记录训练 →</button></view
        >
        <DailyEvidence
          v-if="underage === false"
          :key="`${selectedDate}-${revision}`"
          :date="selectedDate"
          :signal="signals[selectedDate]"
          :loading="loadingSignals"
          @date="selectDate"
          @changed="refreshLocal"
        />

        <view v-if="underage === false" id="review"
          ><ReviewPanel :date="viewDate" @changed="refreshLocal"
        /></view>
      </template>
      <template v-else-if="tab === 'training'">
        <view class="panel today-card"
          ><view class="section-top"
            ><text class="section-title">我的训练安排</text
            ><button class="quiet-button" @tap="settings">
              {{ plan ? '调整' : '建立安排' }} →
            </button></view
          ><text class="muted">{{
            plan
              ? `每周 ${plan.trainingDays.length} 天 · ${plan.location === 'home' ? '居家' : '健身房'} · 每次约 ${plan.durationMinutes} 分钟`
              : '可以先记一次训练，再建立长期安排。'
          }}</text
          ><view class="today-exercises"
            ><text v-for="exercise in suggested" :key="exercise.id" class="pill">{{
              exercise.name
            }}</text></view
          ><button class="primary" @tap="recordTraining">记录力量训练</button></view
        >
        <view class="panel"
          ><text class="section-title">训练日志</text
          ><text v-if="!journal.sessions.length" class="empty">第一条真实记录，会从这里开始。</text
          ><view
            v-for="session in journal.sessions"
            :key="session.id"
            class="session-row"
            @tap="navigateTo(`/pages/lean-muscle/TrainingPage?id=${session.id}`)"
            ><view class="row spread"
              ><text>{{ session.date }} · {{ session.durationMinutes }} 分钟</text
              ><text class="header-link">查看 / 修改 →</text></view
            ><text class="muted">{{
              session.exercises
                .map((e) => `${exerciseName(e.exerciseId)} ${e.sets.length} 组`)
                .join(' · ')
            }}</text></view
          ></view
        >
        <view v-if="plan" class="panel"
          ><text class="section-title">代表动作 · {{ exerciseName(plan.representativeId) }}</text
          ><text class="muted"
            >比较同一变式、器械与 {{ plan.representativeLoadKg }} kg 负重的第一组。</text
          ><view v-for="point in representativeHistory" :key="point.id" class="link-row"
            ><text>{{ point.date }}</text
            ><text class="metric">{{ point.reps }} <text class="tiny">次</text></text></view
          ><text v-if="!representativeHistory.length" class="empty"
            >保存代表动作第一组，建立自己的基线。</text
          ></view
        >
      </template>
      <template v-else>
        <view class="bible-shelf">
          <view class="bible-volume" @tap="openChapter(journal.readingId || bibleChapters[0]!.id)">
            <image :src="leanVisualArt.cover" class="bible-volume-image" mode="aspectFit" />
            <view class="bible-volume-title"
              ><text>薄肌</text><text>圣经</text
              ><text class="volume-subtitle">THE LEAN MUSCLE GUIDE</text></view
            >
          </view>
          <view class="bible-shelf-copy"
            ><text class="eyebrow">你的力量养成之书</text
            ><text class="shelf-title">{{ '读懂身体，\n从这一页开始。' }}</text
            ><text class="muted">八章指南，把理解变成行动。</text
            ><text class="note">原创整理 · 有据可查</text
            ><button
              class="shelf-read"
              @tap="openChapter(journal.readingId || bibleChapters[0]!.id)"
            >
              {{ journal.readingId ? '继续阅读 →' : '翻开第一页 →' }}
            </button></view
          >
        </view>
        <view class="chapter-directory" :style="{ backgroundImage: `url(${leanVisualArt.paper})` }">
          <view class="directory-heading"><text>CONTENTS</text><text>目 录</text></view>
          <view
            v-for="chapter in bibleChapters"
            :key="chapter.id"
            class="link-row"
            @tap="openChapter(chapter.id)"
            ><text class="chapter-number">{{ String(chapter.number).padStart(2, '0') }}</text
            ><view style="flex: 1"
              ><text>{{ chapter.title }}</text
              ><text class="muted">{{ chapter.principle }}</text></view
            ><text class="tiny"
              >{{
                journal.bookmarks.includes(chapter.id) ? '已收藏' : `${chapter.minutes} 分钟`
              }}
              →</text
            ></view
          ></view
        >
        <text class="note">规律训练、完整饮食、足够恢复。每章都可以加入自己的行动。</text>
      </template> </view
    ><text class="note"
      >个人记录保存在当前账号的本机空间。评分是养成反馈，健康问题请结合个人情况寻求专业指导。</text
    >
  </view>
</template>
<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { onHide, onLoad, onShow } from '@dcloudio/uni-app';
import AppNavBar from '../../components/AppNavBar.vue';
import LeanArt from './LeanArt.vue';
import { leanVisualArt } from '../../features/lean-muscle/visual-art.js';
import ScorePanel from './ScorePanel.vue';
import DailyEvidence from './DailyEvidence.vue';
import ReviewPanel from './ReviewPanel.vue';
import { loadJournal, getWeekPlan, togglePaused } from '../../features/lean-muscle/store.js';
import { scoreWeek } from '../../features/lean-muscle/score.js';
import { loadCachedSignals, loadWeekSignals } from '../../features/lean-muscle/signals.js';
import {
  shanghaiDate,
  shiftDate,
  weekDates,
  weekday,
} from '../../features/lean-muscle/calendar.js';
import {
  DEFAULT_PLAN,
  recommendedExercises,
  exerciseName,
} from '../../features/lean-muscle/training.js';
import { bibleChapters } from '../../features/lean-muscle/bible.js';
import { hubDestination } from '../../features/lean-muscle/hub-navigation.js';
import { scrollToReadingSection } from '../../components/reading-navigation.js';
import { navigateTo, navigateToXuxu } from '../../utils/router.js';
import { userStorageKey } from '../../features/auth/user-storage.js';
import {
  localUnderageProfile,
  resolveUnderageProfile,
} from '../../features/lean-muscle/eligibility.js';
const tabs = [
  { id: 'overview', label: '今日' },
  { id: 'training', label: '训练' },
  { id: 'score', label: '评分' },
  { id: 'bible', label: '圣经' },
];
const tab = ref('overview');
const today = ref(shanghaiDate());
const viewDate = ref(today.value);
const selectedDate = ref(today.value);
const journal = ref(loadJournal());
const signals = ref(loadCachedSignals());
const error = ref('');
const loadingSignals = ref(false);
const revision = ref(0);
let request = 0;
let scrollReview = false;
const underage = ref<boolean | null>(localUnderageProfile());
const plan = computed(() => getWeekPlan(journal.value, today.value));
const score = computed(() => scoreWeek(journal.value, signals.value, viewDate.value));
const todayScore = computed(() => scoreWeek(journal.value, signals.value, today.value));
const suggested = computed(() => recommendedExercises(plan.value || DEFAULT_PLAN));
const isTrainingDay = computed(() => plan.value?.trainingDays.includes(weekday(today.value)));
const recommendedChapter = computed(
  () => bibleChapters[!plan.value ? 0 : todayScore.value.dimensions[1]!.coverage < 0.5 ? 3 : 2]!,
);
const representativeHistory = computed(() =>
  journal.value.sessions
    .flatMap((s) =>
      s.exercises
        .filter(
          (e) =>
            e.exerciseId === plan.value?.representativeId &&
            e.sets[0]?.loadKg === plan.value?.representativeLoadKg,
        )
        .map((e) => ({ id: s.id, date: s.date, reps: e.sets[0]!.reps })),
    )
    .slice(0, 8),
);
function refreshLocal() {
  journal.value = loadJournal();
  revision.value++;
}
async function refresh() {
  const current = ++request;
  loadingSignals.value = true;
  refreshLocal();
  signals.value = loadCachedSignals();
  try {
    const result = await loadWeekSignals(viewDate.value);
    if (current === request && result) signals.value = { ...signals.value, ...result };
  } catch {
    if (current === request) error.value = '饮食读取暂不可用，训练与阅读仍可使用。';
  } finally {
    if (current === request) loadingSignals.value = false;
  }
}
function previousWeek() {
  viewDate.value = shiftDate(weekDates(viewDate.value)[0]!, -1);
  selectedDate.value = viewDate.value;
  void refresh();
}
function currentWeek() {
  viewDate.value = today.value;
  selectedDate.value = today.value;
  void refresh();
}
function selectDate(date: string) {
  selectedDate.value = date;
  if (!weekDates(viewDate.value).includes(date)) {
    viewDate.value =
      date <= shiftDate(weekDates(today.value)[0]!, -1) ? weekDates(date)[6]! : today.value;
    void refresh();
  }
}
function settings() {
  navigateTo('/pages/lean-muscle/SettingsPage');
}
function recordTraining() {
  navigateTo('/pages/lean-muscle/TrainingPage');
}
function openChapter(id: string) {
  navigateTo(`/pages/lean-muscle/BiblePage?id=${encodeURIComponent(id)}`);
}
function pause() {
  try {
    togglePaused(today.value);
    refreshLocal();
  } catch {
    error.value = '保存失败，请重试';
  }
}
onLoad((query) => {
  const destination = hubDestination(query);
  tab.value = destination.tab;
  scrollReview = destination.review;
});
let visible = false;
function focusReview() {
  if (!visible || !scrollReview || tab.value !== 'score' || underage.value !== false) return;
  scrollReview = false;
  void nextTick(() => {
    if (visible && tab.value === 'score' && underage.value === false) {
      scrollToReadingSection('#review', () => {
        error.value = '可向下滑动查看本周复盘。';
      });
    }
  });
}
watch([underage, tab], focusReview);
onShow(() => {
  visible = true;
  const previousToday = today.value;
  today.value = shanghaiDate();
  underage.value = localUnderageProfile();
  const currentAccount = userStorageKey('lean-eligibility');
  void resolveUnderageProfile().then((value) => {
    if (currentAccount === userStorageKey('lean-eligibility')) underage.value = value;
  });
  if (viewDate.value === previousToday) viewDate.value = today.value;
  if (selectedDate.value === previousToday) selectedDate.value = today.value;
  void refresh();
  focusReview();
});
onHide(() => {
  visible = false;
  request++;
  loadingSignals.value = false;
});
</script>
<style scoped>
.hero-title {
  white-space: pre-line;
}
.today-exercises {
  display: flex;
  gap: 10rpx;
  flex-wrap: wrap;
  margin: 24rpx 0;
}
.bible-intro {
  position: relative;
  padding-right: 175rpx;
  min-height: 210rpx;
}
.bible-cover {
  position: absolute;
  right: 12rpx;
  top: 32rpx;
  width: 155rpx;
  height: 155rpx;
}
</style>
