<template>
  <view class="lean-page bible-page">
    <AppNavBar title="薄肌圣经" route="/pages/lean-muscle/BiblePage" />
    <view class="book-reading-tools reading-toolbar row spread"
      ><button class="quiet-button" @tap="toggleTextSize">
        {{ larger ? '恢复字号' : '放大字号' }}</button
      ><button class="quiet-button" @tap="bookmark">
        {{ bookmarked ? '已收藏 · 取消' : '收藏这一章' }}
      </button></view
    >
    <view class="reading-progress" aria-label="章节位置"
      ><view
        class="reading-progress-fill"
        :style="{ width: `${(chapter.number / 8) * 100}%` }" /></view
    ><view
      class="paper-sheet"
      :key="chapter.id"
      :style="{ backgroundImage: `url(${leanVisualArt.paper})` }"
    >
      <view class="paper-ribbon" />
      <view class="paper-running-head"><text>和生序 · 薄肌圣经</text><text>VOL. 01</text></view>
      <view class="book-chapter-heading">
        <text class="book-chapter-kicker"
          >CHAPTER {{ String(chapter.number).padStart(2, '0') }}</text
        >
        <view class="book-ornament"><view /><text>✦</text><view /></view>
        <text class="book-chapter-title">{{ chapter.title }}</text>
        <text class="book-reading-time">{{ chapter.minutes }} 分钟 · 从理解到行动</text>
      </view>
      <view class="book-principle"
        ><text class="principle-label">本章要义</text
        ><text class="section-title">{{ chapter.principle }}</text></view
      >
      <view class="book-body"
        ><text
          v-for="(paragraph, i) in chapter.paragraphs"
          :key="i"
          class="read-copy"
          :style="larger ? 'font-size:34rpx' : ''"
          selectable
          >{{ paragraph }}</text
        ></view
      >
      <view class="paper-page-number"
        ><view /><text>— {{ String(chapter.number).padStart(2, '0') }} —</text><view
      /></view>
    </view>
    <view class="reader-completion"
      ><button :class="['secondary', { 'reader-done': chapterCompleted }]" @tap="toggleComplete">
        {{ chapterCompleted ? '✓ 本章已读完 · 点击取消' : '标记本章读完' }}</button
      ><text>读完标记同步到书柜，训练与评分单独记录。</text></view
    ><view class="panel book-action"
      ><text class="eyebrow">把这一页，变成一次行动</text
      ><text class="section-title" style="margin: 15rpx 0 24rpx">{{ chapter.action }}</text
      ><button class="primary" @tap="navigateTo(chapter.route)">去完成这个行动 →</button
      ><button class="quiet-button" style="margin-top: 20rpx; display: block" @tap="askXuxu">
        让序序解释这一章</button
      ><text class="note">点击后复制问题，再进入序序对话；由你确认发送。</text></view
    >
    <view class="panel book-sources"
      ><view class="field-guide-note-top"
        ><text class="section-title">资料出处</text
        ><image
          v-if="readingDecoration"
          :src="readingDecoration"
          class="field-guide-decor"
          mode="aspectFit" /></view
      ><text
        v-for="source in chapter.sources"
        :key="source.url"
        class="source-link"
        @tap="copySource(source.url)"
        >{{ source.title }} ↗</text
      ><text class="note"
        >点击复制原文链接，可在浏览器查看。本文为和生序原创整理，保留参考出处。</text
      ></view
    >
    <text v-if="error" class="error">{{ error }}</text>
    <text class="chapter-position">第 {{ chapter.number }} 章 / 共 8 章</text
    ><view class="footer-actions"
      ><button class="secondary" :disabled="chapter.number === 1" @tap="move(-1)">上一章</button
      ><button class="secondary" :disabled="chapter.number === 8" @tap="move(1)">
        下一章
      </button></view
    >
  </view>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AppNavBar from '../../components/AppNavBar.vue';
import { readingDecoration } from '../../features/version-answer/decoration.js';
import {
  loadLibrary,
  markBibleComplete,
  saveReaderTextSize,
} from '../../features/version-answer/store.js';
import { leanVisualArt } from '../../features/lean-muscle/visual-art.js';
import { bibleChapters } from '../../features/lean-muscle/bible.js';
import { loadJournal, saveReading } from '../../features/lean-muscle/store.js';
import { navigateTo, navigateToXuxu } from '../../utils/router.js';
const chapterIndex = ref(0);
const chapter = computed(() => bibleChapters[chapterIndex.value]!);
const bookmarks = ref(loadJournal().bookmarks);
const bookmarked = computed(() => bookmarks.value.includes(chapter.value.id));
const readingState = ref(loadLibrary());
const larger = ref(readingState.value.largeText);
const chapterCompleted = computed(() =>
  readingState.value.completedBibleIds.includes(chapter.value.id),
);
const error = ref('');
function remember() {
  try {
    saveReading(chapter.value.id);
  } catch {
    error.value = '阅读位置暂未保存，可以继续阅读';
  }
}
onLoad((query) => {
  const index = bibleChapters.findIndex((c) => c.id === query?.id);
  chapterIndex.value = Math.max(0, index);
  remember();
});
function toggleTextSize() {
  larger.value = !larger.value;
  try {
    readingState.value = saveReaderTextSize(larger.value);
    error.value = '';
  } catch {
    error.value = '字号已调整，偏好暂未保存';
  }
}
function toggleComplete() {
  try {
    readingState.value = markBibleComplete(chapter.value.id, !chapterCompleted.value);
    error.value = '';
  } catch {
    error.value = '阅读进度保存失败，请重试';
  }
}
function bookmark() {
  try {
    bookmarks.value = saveReading(chapter.value.id, !bookmarked.value).bookmarks;
    error.value = '';
  } catch {
    error.value = '收藏保存失败，请重试';
  }
}
function move(step: number) {
  chapterIndex.value = Math.min(7, Math.max(0, chapterIndex.value + step));
  remember();
  uni.pageScrollTo({ scrollTop: 0, duration: 0 });
}
function copySource(url: string) {
  uni.setClipboardData({
    data: url,
    success: () => uni.showToast({ title: '链接已复制', icon: 'none' }),
  });
}
function askXuxu() {
  uni.setClipboardData({
    data: `请用容易理解的方式解释薄肌圣经这一章：${chapter.value.title}。核心原则：${chapter.value.principle}。我今天可以做的行动是：${chapter.value.action}。`,
    success: () => navigateToXuxu(),
    fail: () => {
      error.value = '复制失败，请重试';
    },
  });
}
</script>
<style scoped>
.bible-page {
  background: #efe5d3;
  color: #4c3a2b;
  padding-bottom: 70rpx;
  background-image: linear-gradient(
    90deg,
    #e8ddc9 0,
    transparent 10%,
    transparent 90%,
    #e8ddc9 100%
  );
}
.book-reading-tools {
  margin: 28rpx 8rpx 24rpx;
}
.book-reading-tools button {
  color: #856346;
  font-size: 23rpx;
}
.paper-sheet {
  position: relative;
  padding: 32rpx 37rpx 28rpx;
  background-color: #f8edd5;
  background-size: 100% 100%;
  border: 1rpx solid #d5bb88;
  border-radius: 4rpx 16rpx 16rpx 4rpx;
  box-shadow:
    7rpx 5rpx 0 #ecdfc4,
    10rpx 8rpx 0 #c7b28e,
    0 18rpx 40rpx #5d47241a;
  overflow: hidden;
}
.paper-sheet::before {
  content: '';
  position: absolute;
  left: 13rpx;
  top: 0;
  bottom: 0;
  width: 1rpx;
  background: #b99b6150;
  box-shadow: 4rpx 0 8rpx #7156210d;
  pointer-events: none;
}
.paper-ribbon {
  position: absolute;
  right: 34rpx;
  top: 0;
  width: 27rpx;
  height: 63rpx;
  background: #aa604b;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%);
  z-index: 1;
}
.paper-running-head {
  display: flex;
  justify-content: space-between;
  font-size: 18rpx;
  letter-spacing: 2rpx;
  color: #93764e;
  border-bottom: 1rpx solid #bfa36b70;
  padding-bottom: 16rpx;
  padding-right: 45rpx;
}
.book-chapter-heading {
  text-align: center;
  padding: 34rpx 0 32rpx;
}
.book-chapter-kicker {
  display: block;
  font-size: 19rpx;
  letter-spacing: 5rpx;
  color: #a78349;
}
.book-ornament {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  color: #aa8549;
  margin: 17rpx 0;
}
.book-ornament view {
  width: 66rpx;
  height: 1rpx;
  background: #bea16c;
}
.book-ornament text {
  font-size: 19rpx;
}
.book-chapter-title {
  display: block;
  font-family: Georgia, 'Songti SC', 'STSong', 'SimSun', serif;
  font-size: 43rpx;
  letter-spacing: 5rpx;
  font-weight: 700;
  color: #513b25;
}
.book-reading-time {
  display: block;
  font-size: 21rpx;
  color: #9a7e54;
  margin-top: 12rpx;
}
.book-principle {
  border-top: 3rpx double #b69a63;
  border-bottom: 3rpx double #b69a63;
  padding: 20rpx 0 22rpx;
  margin-bottom: 26rpx;
}
.principle-label {
  display: block;
  color: #9d7442;
  font-size: 19rpx;
  letter-spacing: 4rpx;
  margin-bottom: 10rpx;
}
.book-principle .section-title {
  font-family: Georgia, 'Songti SC', 'STSong', 'SimSun', serif;
  font-size: 29rpx;
  line-height: 1.7;
  color: #654b2e;
}
.paper-sheet .read-copy {
  font-family: Georgia, 'Songti SC', 'STSong', 'SimSun', serif;
  color: #4e3e2c;
  line-height: 2.05;
  font-size: 29rpx;
  margin: 22rpx 0;
}
.book-body .read-copy:first-child::first-letter {
  font-size: 41rpx;
  font-weight: 700;
  color: #8c573b;
}
.paper-page-number {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 22rpx;
  margin-top: 40rpx;
  font-family: Georgia, serif;
  color: #937347;
  font-size: 23rpx;
}
.paper-page-number view {
  height: 1rpx;
  width: 66rpx;
  background: #b99b6655;
}
.book-action {
  margin-top: 37rpx !important;
  background: #fff8e9 !important;
  border-color: #dbc79e !important;
  position: relative;
}
.book-action::before {
  content: '';
  position: absolute;
  left: 0;
  top: 26rpx;
  bottom: 26rpx;
  width: 5rpx;
  background: #c89659;
  border-radius: 4rpx;
}
.book-action .eyebrow {
  color: #a17145;
  font-size: 20rpx;
  letter-spacing: 2rpx;
}
.book-action .section-title {
  color: #6a4c31;
}
.book-action .primary {
  background: #996c42;
  color: #fff7e6;
}
.book-sources {
  background: #f7efdf !important;
  border-color: #e1d2b7 !important;
}
.book-sources .section-title {
  color: #795c3c;
}
.book-sources .source-link {
  color: #937044;
}
.bible-page .footer-actions .secondary {
  background: #e5d5b9;
  color: #7b5b36;
}
</style>
