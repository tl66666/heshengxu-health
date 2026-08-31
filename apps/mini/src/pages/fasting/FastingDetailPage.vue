<template>
  <view class="page">
    <image class="leaf" src="/static/illustrations/leaf-corner-decoration.png" mode="aspectFit" />

    <view class="nav">
      <button class="icon-button back" aria-label="返回" @tap="goBack"><text>‹</text></button>
      <view class="nav-title">
        <text>轻断食</text>
        <text class="nav-date">{{ todayLabel }} · 当前计划</text>
      </view>
      <button class="icon-button help" aria-label="轻断食说明" @tap="showTips = !showTips"><text>i</text></button>
    </view>

    <view class="calendar" aria-label="本周日期">
      <view v-for="day in calendar" :key="day.date" class="cal-day" :class="{ today: day.date === today }">
        <text class="weekday">{{ day.week }}</text>
        <text class="day-number">{{ day.day }}</text>
        <view v-if="plan.checkins.includes(day.date)" class="check-dot" />
      </view>
    </view>

    <view class="plan-card">
      <view class="plan-head">
        <view>
          <text class="eyebrow">今日计划详情</text>
          <text class="plan-title">{{ plan.mode }} 轻断食</text>
          <text class="plan-subtitle">{{ statusTitle }}</text>
        </view>
        <button class="reminder" @tap="settingsVisible = true"><text class="bell">⌁</text> 设置提醒</button>
      </view>

      <view class="window-line">
        <view class="window-point"><text>{{ plan.active ? '本次开始' : '用餐开始' }}</text><strong>{{ displayStart }}</strong></view>
        <view class="line-center"><view class="line-track" /><text>{{ plan.active ? `${fastHours} 小时断食` : `${eatingHours} 小时用餐` }}</text></view>
        <view class="window-point end"><text>{{ plan.active ? '预计结束' : '用餐结束' }}</text><strong>{{ displayEnd }}</strong></view>
      </view>

      <view class="howto"><view class="howto-mark">今天这样做</view><view class="howto-copy"><text>{{ nextWindowText }}</text><text>{{ plan.mode }} = {{ fastHours }} 小时断食 + {{ eatingHours }} 小时用餐</text></view></view>

      <view class="progress-area">
        <text class="status-headline">{{ statusHeadline }}</text>
        <view class="progress-ring" :style="{ '--progress': `${progressValue * 360}deg` }">
          <view class="ring-core">
            <text class="ring-kicker">{{ isEating ? '正在用餐' : '正在断食' }}</text>
            <text class="ring-time">{{ remaining }}</text>
            <text class="ring-caption">{{ plan.active ? `已持续 ${elapsedLabel}` : '准备好后开始计时' }}</text>
          </view>
        </view>
        <view class="phase-note"><view class="phase-icon">{{ isEating ? '用餐' : '断食' }}</view><text>{{ isEating ? '现在可以正常用餐，记得记录第一口' : '现在先喝水，等到用餐窗口再进食' }}</text></view>
      </view>

      <view class="actions">
        <button class="primary" :disabled="plan.active" @tap="startFast">{{ plan.active ? '今日已开始' : '提前开始断食' }}</button>
        <button class="secondary" @tap="secondaryAction">{{ plan.active ? '结束并记录' : '修改用餐计划' }}</button>
      </view>

      <view class="schedule">
        <view class="schedule-head">
          <view class="legend"><i class="dot fast" />断食计划</view>
          <view class="legend"><i class="dot eat" />用餐计划</view>
          <button class="checkin" :class="{ done: checkedToday }" @tap="checkin">{{ checkinLabel }}</button>
        </view>
        <view class="timebar"><view class="fast-segment" /><view class="eat-segment" /><view class="fast-segment" /></view>
        <view class="time-labels"><text>{{ plan.eatingStart }}</text><text>{{ plan.eatingEnd }}</text></view>
        <text class="schedule-note">{{ checkedToday ? '今天的用餐时间已记下，继续按自己的节奏来' : '完成用餐打卡后，才会计入今日节律' }}</text>
      </view>
    </view>

    <view class="record-section">
      <view class="record-heading"><view><text class="record-title">最近记录</text><text class="record-subtitle">只显示你亲自保存的内容</text></view><text class="record-count">{{ recordCount }} 条</text></view>
      <view v-if="mealLogs.length || recentSessions.length" class="record-list">
        <view v-for="item in mealLogs" :key="item.id" class="record-row">
          <view class="record-mark meal-mark">餐</view><view class="record-copy"><text>用餐打卡</text><text>{{ formatDateTime(item.recordedAt) }}</text></view><button class="record-delete" @tap="removeMealLog(item.date)">删除</button>
        </view>
        <view v-for="session in recentSessions" :key="session.id" class="record-row">
          <view class="record-mark fast-mark">断</view><view class="record-copy"><text>断食 {{ session.endedAt ? '已完成' : '进行中' }}</text><text>{{ sessionSummary(session) }}</text></view><text class="record-status">{{ session.endedAt ? '已保存' : '计时中' }}</text>
        </view>
      </view>
      <view v-else class="record-empty"><text>还没有记录，开始一次计时或完成用餐打卡吧</text></view>
    </view>

    <view class="tips-section">
      <view class="tips-heading"><text>轻断食小指南</text><button @tap="showTips = !showTips">{{ showTips ? '收起' : '查看' }} <text>›</text></button></view>
      <view v-if="showTips" class="tips-content">
        <view class="tip-row"><text class="tip-index">01</text><text>断食期间可以喝水、无糖茶或黑咖啡，感到不适时及时结束。</text></view>
        <view class="tip-row"><text class="tip-index">02</text><text>用餐窗口优先选择均衡的一餐，不需要为了补偿而过量进食。</text></view>
        <view class="tip-row"><text class="tip-index">03</text><text>睡眠、喝水和规律饮食同样重要，轻断食只是辅助节律。</text></view>
      </view>
      <view v-else class="tips-preview"><text>从规律开始，给身体一点温和的留白</text><text class="arrow">›</text></view>
    </view>

    <view v-if="settingsVisible" class="scrim" @tap="settingsVisible = false">
      <view class="settings-sheet" @tap.stop>
        <view class="sheet-handle" />
        <view class="settings-head"><view><text class="settings-title">设置用餐时间</text><text class="settings-subtitle">每天按这个节奏提醒你</text></view><button class="close" @tap="settingsVisible = false">×</button></view>
        <text class="section-label">选择断食模式</text>
        <view class="mode-grid">
          <button v-for="mode in modes" :key="mode" class="mode-card" :class="{ selected: plan.mode === mode }" @tap="selectMode(mode)">
            <text class="mode-name">{{ mode }}</text><text class="mode-desc">{{ modeDescription(mode) }}</text><view v-if="plan.mode === mode" class="mode-check">✓</view>
          </button>
        </view>
        <text class="section-label">用餐窗口</text>
        <picker mode="time" :value="plan.eatingStart" @change="setStart"><view class="time-row"><text>开始用餐</text><strong>{{ plan.eatingStart }}</strong><text class="chevron">›</text></view></picker>
        <picker mode="time" :value="plan.eatingEnd" @change="setEnd"><view class="time-row"><text>结束用餐</text><strong>{{ plan.eatingEnd }}</strong><text class="chevron">›</text></view></picker>
        <view class="sheet-summary"><text>每天 {{ plan.eatingStart }} - {{ plan.eatingEnd }}</text><text>{{ eatingHours }} 小时用餐 · {{ fastHours }} 小时断食</text></view>
        <button class="save" @tap="settingsVisible = false">保存设置</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onHide, onShow } from '@dcloudio/uni-app';
import { durationMinutes, elapsedSeconds, finishFasting, formatDuration, formatRemaining, isEatingNow, loadFastingPlan, localDate, phaseProgress, recordMeal, removeMeal, remainingSeconds, startFasting, saveFastingPlan, type FastingMode, type FastingSession, type MealLog } from '../../features/fasting/fasting-store.js';

const today = localDate();
const plan = ref(loadFastingPlan());
const now = ref(new Date());
const showTips = ref(false);
const settingsVisible = ref(false);
let ticker: ReturnType<typeof setInterval> | undefined;
const modes: FastingMode[] = ['16:8', '14:10', '12:12', '18:6'];
const weekNames = ['日', '一', '二', '三', '四', '五', '六'];

const calendar = computed(() => Array.from({ length: 7 }, (_, index) => {
  const date = new Date();
  date.setDate(date.getDate() - (date.getDay() || 7) + 1 + index);
  const iso = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  return { date: iso, day: date.getDate(), week: weekNames[date.getDay()] };
}));
const todayLabel = computed(() => `${now.value.getMonth() + 1}月${now.value.getDate()}日`);
const remaining = computed(() => formatRemaining(plan.value, now.value));
const eatingHours = computed(() => Math.round(durationMinutes(plan.value) / 60));
const fastHours = computed(() => 24 - eatingHours.value);
const progressValue = computed(() => plan.value.active ? Math.min(1, elapsedSeconds(plan.value, now.value) / Math.max(1, fastHours.value * 3600)) : phaseProgress(plan.value, now.value));
const isEating = computed(() => isEatingNow(plan.value, now.value));
const checkedToday = computed(() => plan.value.checkins.includes(today));
const statusTitle = computed(() => plan.value.active ? (isEating.value ? '把握舒服的用餐时间' : '给身体一段安静时间') : '准备好后，从一个温和的开始');
const statusHeadline = computed(() => plan.value.active ? (isEating.value ? '你正在用餐中' : '你正在断食中') : (isEating.value ? '现在是用餐时间' : '现在是断食时间'));
const activeSession = computed(() => [...plan.value.sessions].reverse().find((session) => !session.endedAt));
const displayStart = computed(() => activeSession.value ? formatClock(activeSession.value.startedAt) : plan.value.eatingStart);
const displayEnd = computed(() => activeSession.value?.plannedEndAt ? formatClock(activeSession.value.plannedEndAt) : plan.value.eatingEnd);
const nextWindowText = computed(() => isEating.value ? `用餐窗口 ${plan.value.eatingStart} - ${plan.value.eatingEnd}` : `下一次用餐从 ${plan.value.eatingStart} 开始`);
const checkinLabel = computed(() => checkedToday.value ? '撤销用餐记录' : (plan.value.active && !isEating.value ? '提前结束并记录' : '用餐打卡'));
const elapsedLabel = computed(() => formatDuration(elapsedSeconds(plan.value, now.value)));
const mealLogs = computed<MealLog[]>(() => [...plan.value.mealLogs].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt)).slice(0, 4));
const recentSessions = computed<FastingSession[]>(() => [...plan.value.sessions].sort((a, b) => b.startedAt.localeCompare(a.startedAt)).slice(0, 4));
const recordCount = computed(() => mealLogs.value.length + recentSessions.value.length);
const sessionDuration = (session: FastingSession) => Math.max(0, Math.floor(((session.endedAt ? new Date(session.endedAt) : now.value).getTime() - new Date(session.startedAt).getTime()) / 1000));
const formatClock = (value: string) => { const date = new Date(value); return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`; };
const formatDateTime = (value: string) => { const date = new Date(value); return `${date.getMonth() + 1}月${date.getDate()}日 ${formatClock(value)}`; };
const sessionSummary = (session: FastingSession) => `${formatDateTime(session.startedAt)}${session.endedAt ? ` · 持续 ${formatDuration(sessionDuration(session))}` : ''}`;

function refresh() { plan.value = loadFastingPlan(); now.value = new Date(); }
function startFast() { plan.value = startFasting(now.value); }
function finishFast() { plan.value = finishFasting(now.value); }
function secondaryAction() { if (plan.value.active) finishFast(); else settingsVisible.value = true; }
function checkin() {
  if (checkedToday.value) { plan.value = removeMeal(today); return; }
  if (plan.value.active && !isEating.value) finishFasting(now.value);
  plan.value = recordMeal(now.value);
}
function removeMealLog(date: string) { plan.value = removeMeal(date); }
function selectMode(mode: FastingMode) {
  const hours = Number(mode.split(':')[0]);
  const startHour = Number(plan.value.eatingStart.slice(0, 2));
  const endHour = (startHour + (24 - hours)) % 24;
  plan.value = saveFastingPlan({ mode, eatingEnd: `${String(endHour).padStart(2, '0')}:00` });
}
function modeDescription(mode: FastingMode) { return `${mode.split(':')[0]}小时断食 · ${mode.split(':')[1]}小时用餐`; }
function setStart(event: { detail: { value: string } }) { plan.value = saveFastingPlan({ eatingStart: event.detail.value }); }
function setEnd(event: { detail: { value: string } }) { plan.value = saveFastingPlan({ eatingEnd: event.detail.value }); }
function goBack() { uni.navigateBack(); }
onShow(() => { refresh(); if (!ticker) ticker = setInterval(() => { now.value = new Date(); if (plan.value.active) plan.value = remainingSeconds(plan.value, now.value) <= 0 ? finishFasting(now.value) : loadFastingPlan(); }, 1000); });
onHide(() => { if (ticker) { clearInterval(ticker); ticker = undefined; } });
</script>

<style scoped>
.page { min-height:100vh; box-sizing:border-box; padding:calc(104rpx + env(safe-area-inset-top)) 28rpx calc(56rpx + env(safe-area-inset-bottom)); color:#394458; background:#f1faf7; position:relative; overflow:hidden; }
.leaf { position:absolute; right:-100rpx; top:-40rpx; width:360rpx; height:300rpx; opacity:.18; pointer-events:none; }
.nav { min-height:72rpx; display:flex; align-items:center; justify-content:space-between; position:relative; z-index:1; margin-bottom:24rpx; }
.icon-button { width:72rpx; height:72rpx; padding:0; border:0; color:#3e4b61; background:transparent; line-height:72rpx; }.icon-button text { display:block; text-align:center; }
.back { font-size:58rpx; }.help { color:#7c8d98; font-size:30rpx; }.help text { width:38rpx; height:38rpx; margin:17rpx auto 0; border:2rpx solid #9eafb1; border-radius:50%; line-height:34rpx; }
.nav-title { display:flex; align-items:center; flex-direction:column; gap:6rpx; font-size:36rpx; font-weight:700; letter-spacing:1rpx; }.nav-date { color:#8b9aa5; font-size:20rpx; font-weight:500; letter-spacing:0; }
.calendar { display:flex; margin:0 -4rpx 24rpx; position:relative; z-index:1; }
.cal-day { width:14.285%; min-height:100rpx; display:flex; align-items:center; flex-direction:column; gap:11rpx; color:#8b9aa7; font-size:22rpx; position:relative; }
.weekday { font-size:21rpx; }
.day-number { width:66rpx; height:66rpx; display:flex; align-items:center; justify-content:center; border-radius:22rpx; color:#6f8090; font-size:28rpx; font-weight:600; }
.cal-day.today .day-number { color:#fff; background:#6ac9a8; box-shadow:0 12rpx 26rpx rgba(81,176,144,.25); }
.cal-day.today .weekday { color:#4caa88; font-weight:700; }
.check-dot { position:absolute; bottom:-2rpx; width:8rpx; height:8rpx; border-radius:50%; background:#e8a18d; }
.plan-card { position:relative; z-index:1; padding:34rpx 30rpx 28rpx; border:1rpx solid rgba(255,255,255,.7); border-radius:34rpx; background:rgba(255,255,255,.94); box-shadow:0 20rpx 50rpx rgba(88,137,130,.11); }
.plan-head,.settings-head,.tips-heading,.schedule-head,.time-labels { display:flex; align-items:center; justify-content:space-between; }
.eyebrow { display:block; color:#93a3aa; font-size:20rpx; letter-spacing:2rpx; }
.plan-title { display:block; margin-top:8rpx; color:#354257; font-size:35rpx; font-weight:700; }
.plan-subtitle { display:block; margin-top:8rpx; color:#82919c; font-size:22rpx; }
.reminder { padding:0; color:#62b996; border:0; background:transparent; font-size:21rpx; }
.bell { display:inline-flex; align-items:center; justify-content:center; width:34rpx; height:34rpx; margin-right:4rpx; border-radius:50%; color:#fff; background:#7bcdae; font-size:21rpx; }
.window-line { display:flex; align-items:flex-end; margin-top:34rpx; }
.window-point { min-width:126rpx; color:#9aa7af; font-size:20rpx; }
.window-point strong { display:block; margin-top:8rpx; color:#425069; font-size:30rpx; }
.window-point.end { text-align:right; }
.line-center { flex:1; position:relative; margin:0 18rpx 16rpx; text-align:center; }
.line-track { height:2rpx; background:#d7e2df; }
.line-center:before,.line-center:after { content:''; position:absolute; top:-5rpx; width:12rpx; height:12rpx; border:2rpx solid #9acfb7; border-radius:50%; background:#fff; }
.line-center:before { left:0; }.line-center:after { right:0; }
.line-center text { position:absolute; left:50%; top:-30rpx; transform:translateX(-50%); padding:4rpx 12rpx; border-radius:10rpx; color:#78a89d; background:#eef8f2; font-size:19rpx; white-space:nowrap; }
.howto { display:flex; align-items:center; gap:16rpx; margin-top:24rpx; padding:18rpx 18rpx; border-radius:18rpx; background:#f7faf5; }.howto-mark { flex:0 0 auto; padding:8rpx 10rpx; border-radius:12rpx; color:#6da48e; background:#e7f4eb; font-size:18rpx; font-weight:700; }.howto-copy { flex:1; }.howto-copy text { display:block; }.howto-copy text:first-child { color:#60766f; font-size:21rpx; font-weight:600; }.howto-copy text:last-child { margin-top:5rpx; color:#a0ada9; font-size:18rpx; }
.progress-area { display:flex; align-items:center; flex-direction:column; padding:30rpx 0 26rpx; }
.status-headline { margin-bottom:18rpx; color:#3fbd8b; font-size:34rpx; font-weight:700; letter-spacing:1rpx; }
.progress-ring { width:390rpx; height:390rpx; display:flex; align-items:center; justify-content:center; border-radius:50%; background:conic-gradient(#72cda7 0deg, #89a6ed var(--progress), #f3dcd7 var(--progress), #f3dcd7 280deg, #edf0f1 280deg 360deg); transform:rotate(-90deg); }
.ring-core { width:306rpx; height:306rpx; display:flex; align-items:center; justify-content:center; flex-direction:column; border-radius:50%; background:#fff; transform:rotate(90deg); box-shadow:inset 0 0 0 1rpx #f3f5f3; }
.ring-kicker { color:#86949f; font-size:24rpx; }.ring-time { margin:12rpx 0 8rpx; color:#35435b; font-size:52rpx; font-weight:700; letter-spacing:1rpx; }.ring-caption { color:#a1adb4; font-size:20rpx; }
.phase-note { display:flex; align-items:center; gap:10rpx; margin-top:18rpx; color:#8a99a1; font-size:21rpx; }.phase-icon { width:42rpx; height:30rpx; display:flex; align-items:center; justify-content:center; border-radius:15rpx; color:#b27f70; background:#fbefdf; font-size:14rpx; font-weight:700; letter-spacing:.5rpx; }
.actions { display:flex; gap:14rpx; }.actions button { flex:1; height:78rpx; border-radius:40rpx; font-size:24rpx; }.primary { color:#fff; background:#69cda2; box-shadow:0 10rpx 20rpx rgba(93,192,150,.2); }.secondary { color:#7398d5; border:2rpx solid #a9c2ec; background:#fff; }.actions button[disabled] { opacity:.52; }
.schedule { margin-top:28rpx; padding-top:24rpx; border-top:1rpx solid #edf1ef; }.schedule-head { color:#8a98a1; font-size:20rpx; }.legend { display:flex; align-items:center; margin-right:22rpx; }.dot { width:14rpx; height:14rpx; margin-right:7rpx; border-radius:50%; }.dot.fast { background:#8ea7ed; }.dot.eat { background:#70cea5; }
.checkin { padding:10rpx 20rpx; border-radius:24rpx; color:#fff; background:#69cda2; font-size:20rpx; }.checkin.done { color:#62aa91; background:#e7f6ee; }
.timebar { display:flex; height:16rpx; margin-top:22rpx; overflow:hidden; border-radius:10rpx; background:#edf0f5; }.fast-segment { flex:1; background:#8fa8ef; }.eat-segment { flex:2; background:#73cfa7; }.time-labels { margin-top:10rpx; color:#929fa8; font-size:20rpx; }.schedule-note { display:block; margin-top:18rpx; color:#9aa5aa; font-size:20rpx; text-align:center; }
.tips-section { position:relative; z-index:1; margin-top:30rpx; }.tips-heading { color:#526b87; font-size:25rpx; font-weight:600; }.tips-heading button { padding:0; color:#7b9bc7; border:0; background:transparent; font-size:21rpx; }.tips-heading button text { font-size:28rpx; vertical-align:-2rpx; }.tips-preview { display:flex; justify-content:space-between; margin-top:18rpx; padding:18rpx 20rpx; border-bottom:1rpx solid rgba(129,166,165,.25); color:#8999a2; font-size:21rpx; }.arrow { color:#9eb8cf; font-size:28rpx; }.tips-content { margin-top:14rpx; padding:4rpx 4rpx 0; }.tip-row { display:flex; gap:18rpx; padding:16rpx 0; border-bottom:1rpx dashed rgba(129,166,165,.28); color:#74858e; font-size:21rpx; line-height:1.55; }.tip-index { color:#d3a497; font-size:19rpx; letter-spacing:1rpx; }
.scrim { position:fixed; inset:0; z-index:20; display:flex; align-items:flex-end; background:rgba(45,58,67,.38); }.settings-sheet { width:100%; box-sizing:border-box; padding:14rpx 32rpx calc(30rpx + env(safe-area-inset-bottom)); border-radius:36rpx 36rpx 0 0; background:#fffdf9; box-shadow:0 -16rpx 50rpx rgba(59,81,82,.15); }.sheet-handle { width:74rpx; height:8rpx; margin:0 auto 24rpx; border-radius:8rpx; background:#d6dfdc; }.settings-title { display:block; color:#364358; font-size:32rpx; font-weight:700; }.settings-subtitle { display:block; margin-top:6rpx; color:#9aa6ac; font-size:20rpx; }.close { width:54rpx; height:54rpx; padding:0; color:#93a0a6; border:0; background:transparent; font-size:40rpx; }.section-label { display:block; margin:26rpx 0 14rpx; color:#8d9ca2; font-size:20rpx; letter-spacing:1rpx; }.mode-grid { display:flex; gap:12rpx; }.mode-card { position:relative; flex:1; padding:18rpx 8rpx; border:1rpx solid #e6ece9; border-radius:18rpx; color:#657482; background:#fff; text-align:left; }.mode-card.selected { border-color:#82c9ad; background:#edf8f1; box-shadow:0 8rpx 18rpx rgba(110,191,155,.12); }.mode-name { display:block; color:#43536b; font-size:28rpx; font-weight:700; }.mode-desc { display:block; margin-top:7rpx; color:#94a1a6; font-size:17rpx; line-height:1.4; }.mode-check { position:absolute; top:10rpx; right:10rpx; color:#60b991; font-size:20rpx; }.time-row { display:flex; align-items:center; padding:20rpx 4rpx; border-bottom:1rpx solid #edf1ef; color:#65747e; font-size:23rpx; }.time-row strong { margin-left:auto; color:#42516a; font-size:29rpx; }.chevron { margin-left:18rpx; color:#a1afb4; font-size:30rpx; }.sheet-summary { display:flex; align-items:center; justify-content:space-between; margin:20rpx 0; color:#7fae9d; font-size:20rpx; }.sheet-summary text:last-child { color:#a2adb0; font-size:18rpx; }.save { width:100%; height:80rpx; border-radius:24rpx; color:#fff; background:#6bcba4; font-size:25rpx; box-shadow:0 10rpx 20rpx rgba(95,192,148,.2); }
.record-section { position:relative; z-index:1; margin-top:22rpx; padding:28rpx 26rpx 10rpx; border:1rpx solid rgba(255,255,255,.72); border-radius:28rpx; background:rgba(255,255,255,.78); }
.record-heading { display:flex; align-items:flex-end; justify-content:space-between; }.record-title { display:block; color:#4a5867; font-size:27rpx; font-weight:700; }.record-subtitle { display:block; margin-top:6rpx; color:#a0abb0; font-size:18rpx; }.record-count { color:#9babb1; font-size:19rpx; }.record-list { margin-top:18rpx; }.record-row { display:flex; align-items:center; min-height:76rpx; border-top:1rpx solid #edf2ef; }.record-mark { width:42rpx; height:42rpx; display:flex; align-items:center; justify-content:center; margin-right:14rpx; border-radius:14rpx; font-size:18rpx; font-weight:700; }.meal-mark { color:#b47f70; background:#fff0e8; }.fast-mark { color:#6e8ed2; background:#edf2ff; }.record-copy { flex:1; }.record-copy text { display:block; }.record-copy text:first-child { color:#586878; font-size:22rpx; }.record-copy text:last-child { margin-top:5rpx; color:#a0abb0; font-size:18rpx; }.record-delete { padding:8rpx 0 8rpx 16rpx; color:#c09288; font-size:19rpx; }.record-status { color:#70ad95; font-size:18rpx; }.record-empty { padding:24rpx 0 20rpx; color:#a0adb1; font-size:19rpx; text-align:center; }
@media (max-width: 360px) { .plan-card { padding-left:22rpx; padding-right:22rpx; }.progress-ring { width:340rpx; height:340rpx; }.ring-core { width:266rpx; height:266rpx; }.ring-time { font-size:46rpx; }.window-point { min-width:112rpx; } }
</style>
