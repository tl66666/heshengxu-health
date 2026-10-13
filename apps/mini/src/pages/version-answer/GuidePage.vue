<template>
  <view class="lean-page guide-page">
    <AppNavBar :title="topicTitle || '阅读指南'" route="/pages/version-answer/GuidePage" />
    <template v-if="guide">
      <view class="guide-tools reading-toolbar row spread"
        ><button class="quiet-button" @tap="toggleTextSize">
          {{ larger ? '恢复字号' : '放大字号' }}</button
        ><button class="quiet-button" @tap="showContents = !showContents">
          {{ showContents ? '收起目录' : '本篇目录' }}</button
        ><button class="quiet-button" @tap="bookmark">
          {{ saved ? '已收藏 · 取消' : '收藏指南' }}
        </button></view
      >
      <view v-if="showContents" class="reader-section-list"
        ><button
          v-for="(section, index) in guide.sections"
          :key="section.title"
          @tap="jumpToSection(index)"
        >
          {{ String(index + 1).padStart(2, '0') }} {{ section.title }}
        </button></view
      ><view
        class="guide-paper"
        :class="{ 'large-type': larger }"
        :style="{ backgroundImage: `url(${leanVisualArt.paper})` }"
      >
        <view v-if="position" class="reader-chapter-meta"
          ><text>第 {{ position.number }} / {{ position.total }} 篇</text
          ><text>约 {{ readingMinutes(guide) }} 分钟阅读 · {{ guide.level || '起步' }}</text></view
        ><view class="guide-running-head"
          ><text>版本答案 · {{ topicTitle }}</text
          ><text>FIELD NOTES</text></view
        >
        <view class="guide-heading"
          ><text class="guide-kind">{{ guide.category }}</text
          ><text class="guide-title">{{ guide.title }}</text
          ><text class="guide-subtitle">{{ guide.subtitle }}</text></view
        >
        <view class="guide-context"
          ><view
            ><text>投入</text><text>{{ guide.cost }}</text></view
          ><view
            ><text>希望获得</text><text>{{ guide.benefit }}</text></view
          ></view
        >
        <view
          v-for="(section, index) in guide.sections"
          :key="section.title"
          class="guide-section"
          :id="`guide-section-${index}`"
          ><text class="guide-section-title"
            ><text>{{ String(index + 1).padStart(2, '0') }}　</text>{{ section.title }}</text
          ><text
            v-for="paragraph in section.paragraphs"
            :key="paragraph"
            class="guide-paragraph"
            :style="larger ? 'font-size:34rpx' : ''"
            selectable
            >{{ paragraph }}</text
          ></view
        >
        <view class="guide-paper-footer"
          ><text>— {{ topicTitle }} —</text><text>资料核对 {{ REVIEWED_AT }}</text></view
        >
      </view>
      <view class="reader-completion"
        ><button :class="['secondary', { 'reader-done': completed }]" @tap="toggleComplete">
          {{ completed ? '✓ 已读完 · 点击取消' : '标记本篇读完' }}</button
        ><text>阅读进度由你确认，不计入健康评分。</text></view
      ><view class="panel guide-action"
        ><text class="eyebrow">从这一页，开始一件小事</text
        ><text class="section-title">{{ guide.action }}</text
        ><view class="guide-execution-steps"
          ><view v-for="(step, index) in executionSteps" :key="step"
            ><text>{{ String(index + 1).padStart(2, '0') }}</text
            ><text>{{ step }}</text></view
          ></view
        ><button class="primary" @tap="addAction">
          {{ alreadyAdded ? '已加入 · 查看我的行动' : '加入我的行动' }}</button
        ><button
          v-if="guide.route"
          class="secondary"
          style="margin-top: 18rpx; width: 100%"
          @tap="navigateTo(guide.route)"
        >
          打开对应功能 →
        </button></view
      >
      <view v-if="guide.prompt" class="panel prompt-panel"
        ><view class="section-top"
          ><text class="section-title">可复制的实践模板</text
          ><button class="quiet-button" @tap="copyPrompt">复制</button></view
        ><text class="prompt-copy" selectable>{{ guide.prompt }}</text
        ><text class="note"
          >修改括号中的内容后再使用。模板不会自动调用模型或发送个人资料。</text
        ></view
      >
      <view class="panel source-panel"
        ><view class="field-guide-note-top"
          ><text class="section-title">查看原始出处</text
          ><image
            v-if="readingDecoration"
            :src="readingDecoration"
            class="field-guide-decor"
            mode="aspectFit" /></view
        ><view
          v-for="source in guide.sources"
          :key="source.url"
          class="source-item"
          @tap="copyLink(source.url)"
          ><text class="source-kind">{{ source.kind }}</text
          ><text class="source-title"
            >{{ source.title }} <text class="source-copy-label">复制链接</text></text
          ></view
        ><text v-if="guide.attribution" class="attribution">{{ guide.attribution }}</text
        ><view v-if="guide.attribution" class="attribution-links"
          ><button
            class="quiet-button"
            @tap="copyLink('https://github.com/eternity4719/HowToLiveBetter')"
          >
            原仓库</button
          ><button
            class="quiet-button"
            @tap="copyLink('https://creativecommons.org/licenses/by/4.0/')"
          >
            CC BY 4.0
          </button></view
        ><text class="note"
          >点击复制链接，在浏览器查看原文。人物观点、资料摘要和产品行动在正文中分别说明。</text
        ></view
      >
      <view v-if="position" class="reader-neighbours">
        <button v-if="position.previous" @tap="openGuide(position.previous.id)">
          <text>← 上一篇</text><text>{{ position.previous.title }}</text>
        </button>
        <button v-if="position.next" @tap="openGuide(position.next.id)">
          <text>下一篇 →</text><text>{{ position.next.title }}</text>
        </button>
      </view>
      <button
        class="reader-directory"
        @tap="returnToLibrary({ tab: 'reading', topic: guide.topic })"
      >
        返回本书全部章节 →
      </button>
    </template>
    <view v-else class="panel empty"
      ><text>这篇指南暂时不存在。</text
      ><button class="secondary" @tap="navigateTo('/pages/version-answer/VersionAnswerPage')">
        返回主题目录
      </button></view
    >
    <text v-if="error" class="error">{{ error }}</text>
  </view>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import AppNavBar from '../../components/AppNavBar.vue';
import { scrollToReadingSection } from '../../components/reading-navigation.js';
import { readingDecoration } from '../../features/version-answer/decoration.js';
import { leanVisualArt } from '../../features/lean-muscle/visual-art.js';
import { getGuide, topics, REVIEWED_AT } from '../../features/version-answer/content.js';
import {
  loadLibrary,
  bookmarkGuide,
  saveGuideReading,
  addGuideAction,
  markGuideComplete,
  saveReaderTextSize,
} from '../../features/version-answer/store.js';
import { navigateTo, redirectTo } from '../../utils/router.js';
import {
  chapterPosition,
  readingMinutes,
  actionStepsFor,
} from '../../features/version-answer/learning.js';
import { returnToLibrary } from '../../features/version-answer/navigation.js';
const id = ref('');
const guide = computed(() => getGuide(id.value));
const library = ref(loadLibrary());
const larger = ref(library.value.largeText);
const position = computed(() => (guide.value ? chapterPosition(guide.value) : null));
const executionSteps = computed(() => (guide.value ? actionStepsFor(guide.value) : []));
const completed = computed(() => library.value.completedGuideIds.includes(id.value));
const showContents = ref(false);
function jumpToSection(index: number) {
  scrollToReadingSection(`#guide-section-${index}`, () => {
    error.value = '目录定位暂不可用，可以继续向下阅读';
  });
}
const error = ref('');
const saved = computed(() => library.value.bookmarks.includes(id.value));
const alreadyAdded = computed(() => library.value.actions.some((a) => a.guideId === id.value));
const topicTitle = computed(() => topics.find((t) => t.id === guide.value?.topic)?.title || '');

onLoad((query) => {
  id.value = query?.id || '';
  if (guide.value) {
    try {
      library.value = saveGuideReading(id.value);
    } catch {
      error.value = '阅读位置暂未保存，可以继续阅读';
    }
  }
});
onShow(() => {
  library.value = loadLibrary();
  larger.value = library.value.largeText;
});
function toggleTextSize() {
  larger.value = !larger.value;
  try {
    library.value = saveReaderTextSize(larger.value);
    error.value = '';
  } catch {
    error.value = '字号已调整，偏好暂未保存';
  }
}
function toggleComplete() {
  try {
    library.value = markGuideComplete(id.value, !completed.value);
    error.value = '';
  } catch {
    error.value = '阅读进度保存失败，请重试';
  }
}
function bookmark() {
  try {
    library.value = bookmarkGuide(id.value, !saved.value);
    error.value = '';
  } catch {
    error.value = '收藏保存失败，请重试';
  }
}
function addAction() {
  if (alreadyAdded.value) {
    returnToLibrary({ tab: 'actions', focus: id.value });
    return;
  }
  try {
    library.value = addGuideAction(id.value);
    error.value = '';
    uni.showToast({ title: '已加入我的行动', icon: 'success' });
  } catch {
    error.value = '行动保存失败，请重试';
  }
}
function copyPrompt() {
  if (guide.value?.prompt)
    uni.setClipboardData({
      data: guide.value.prompt,
      fail: () => {
        error.value = '复制失败，请重试';
      },
    });
}
function copyLink(url: string) {
  uni.setClipboardData({
    data: url,
    success: () => uni.showToast({ title: '链接已复制', icon: 'none' }),
    fail: () => {
      error.value = '复制失败，请重试';
    },
  });
}
function openGuide(nextId: string) {
  redirectTo(`/pages/version-answer/GuidePage?id=${encodeURIComponent(nextId)}`);
}
</script>
<style scoped>
.guide-page {
  background: #f0e7d5;
}
.guide-tools {
  margin: 25rpx 3rpx;
}
.guide-tools button {
  font-size: 22rpx;
}
.guide-paper {
  position: relative;
  background-color: #f8edd7;
  background-size: 100% 100%;
  padding: 30rpx 34rpx 29rpx;
  border: 1rpx solid #d5bc91;
  border-radius: 4rpx 18rpx 18rpx 4rpx;
  box-shadow:
    5rpx 4rpx 0 #e7d9bf,
    8rpx 7rpx 0 #cbbb9b;
  overflow: hidden;
}
.guide-paper::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 11rpx;
  width: 1rpx;
  background: #ad8c5855;
  pointer-events: none;
}
.guide-running-head {
  display: flex;
  justify-content: space-between;
  border-bottom: 1rpx solid #b99b6266;
  padding-bottom: 17rpx;
  font-size: 17rpx;
  color: #9d7e51;
  letter-spacing: 1rpx;
  gap: 16rpx;
}
.guide-heading {
  text-align: center;
  padding: 30rpx 0;
}
.guide-kind {
  font-size: 18rpx;
  color: #a27c4a;
  display: block;
  letter-spacing: 2rpx;
}
.guide-title {
  display: block;
  font-family: 'Songti SC', 'STSong', 'SimSun', serif;
  font-size: 35rpx;
  line-height: 1.7;
  color: #624c2f;
  font-weight: 700;
  margin: 16rpx 0;
}
.guide-subtitle {
  display: block;
  font-size: 22rpx;
  color: #9a815d;
  line-height: 1.9;
}
.guide-context {
  border-top: 3rpx double #b9a070;
  border-bottom: 3rpx double #b9a070;
  padding: 19rpx 0;
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}
.guide-context > view {
  display: flex;
  gap: 18rpx;
  font-size: 21rpx;
  line-height: 1.8;
  color: #8b7757;
}
.guide-context > view > text:first-child {
  min-width: 85rpx;
  color: #ab8955;
  flex-shrink: 0;
}
.guide-section {
  margin-top: 32rpx;
}
.guide-section-title {
  display: block;
  color: #82643b;
  font-size: 27rpx;
  font-family: 'Songti SC', 'STSong', 'SimSun', serif;
  font-weight: 700;
  line-height: 1.8;
}
.guide-section-title > text {
  color: #b2935f;
  font-family: Georgia, serif;
  font-weight: 400;
  font-size: 23rpx;
}
.guide-paragraph {
  display: block;
  font-family: 'Songti SC', 'STSong', 'SimSun', serif;
  color: #5c4c34;
  font-size: 28rpx;
  line-height: 2.1;
  margin: 22rpx 0;
}
.guide-paper-footer {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  text-align: center;
  color: #ab8e5e;
  font-size: 19rpx;
  margin-top: 30rpx;
  font-family: Georgia, serif;
}
.guide-action {
  margin-top: 34rpx !important;
  background: #fff8e9 !important;
  border-color: #dac69f !important;
}
.guide-action .section-title {
  font-size: 28rpx;
  line-height: 1.85;
  margin: 17rpx 0 22rpx;
  color: #886743;
}
.guide-action .eyebrow {
  font-size: 18rpx;
  letter-spacing: 2rpx;
}
.source-panel {
  background: #f9f1e0 !important;
  border-color: #e1d1b4 !important;
}
.source-item {
  padding: 18rpx 0;
  border-bottom: 1rpx solid #e1d3b9;
}
.source-kind {
  display: inline-block;
  font-size: 17rpx;
  color: #9d8157;
  background: #eee2ca;
  border-radius: 10rpx;
  padding: 3rpx 9rpx;
  margin-bottom: 6rpx;
}
.source-title {
  display: block;
  color: #947043;
  font-size: 22rpx;
  line-height: 1.9;
}
.attribution {
  display: block;
  color: #a18b6c;
  font-size: 20rpx;
  line-height: 1.9;
  margin: 20rpx 0;
}
.attribution-links {
  display: flex;
  gap: 26rpx;
}
.prompt-panel {
  background: #edf3f2 !important;
  border-color: #d7e3e1 !important;
}
.prompt-panel .section-title {
  color: #6e8b86;
  font-size: 27rpx;
}
.prompt-copy {
  display: block;
  white-space: pre-line;
  font-family: 'Songti SC', 'STSong', serif;
  font-size: 25rpx;
  line-height: 1.9;
  color: #67817d;
  background: #e2edeb;
  border-radius: 15rpx;
  padding: 20rpx;
}
</style>
