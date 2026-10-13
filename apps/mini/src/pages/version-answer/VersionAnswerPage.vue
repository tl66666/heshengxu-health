<template>
  <view class="lean-page version-page library-page">
    <AppNavBar title="版本答案" route="/pages/version-answer/VersionAnswerPage" />
    <view class="version-hero"
      ><view class="version-hero-top"
        ><text>YOUR PERSONAL LIBRARY</text><text>从阅读，到实践</text></view
      ><text class="version-hero-title">{{ '从一页开始，\n把理解变成日常。' }}</text
      ><text class="version-hero-copy">{{
        `五本主题书 · ${guides.length} 篇指南\n还有八章薄肌圣经`
      }}</text
      ><image :src="versionEntryScene" class="version-hero-art" mode="aspectFit"
    /></view>
    <view class="tabs"
      ><button
        v-for="item in tabs"
        :key="item.id"
        :class="{ active: tab === item.id }"
        :aria-pressed="tab === item.id"
        @tap="tab = item.id"
      >
        {{ item.title }}
      </button></view
    >
    <text v-if="error" class="error">{{ error }}</text>
    <view :key="tab" class="library-content">
      <template v-if="tab === 'topics'">
        <view class="library-overview"
          ><view
            ><text>{{ completedCount }}</text
            ><text>阅读完成</text></view
          ><view
            ><text>{{ pendingActions }}</text
            ><text>行动进行中</text></view
          ><view
            ><text>{{ library.bookmarks.length }}</text
            ><text>收藏指南</text></view
          ></view
        >
        <button v-if="library.readingId" class="library-resume" @tap="openGuide(library.readingId)">
          <text>接着上次读</text><text>{{ getGuide(library.readingId)?.title }} →</text>
        </button>
        <view class="section-top"
          ><text class="section-title">你的成长书柜</text
          ><text class="tiny">点书封开始阅读</text></view
        >
        <view class="bookcase"
          ><view class="bookcase-crown"
            ><text>THE PERSONAL LIBRARY</text><view class="bookcase-brass-mark"
          /></view>
          <view
            v-for="(row, rowIndex) in shelfRows"
            :key="rowIndex"
            :class="['bookcase-row', { 'last-shelf': rowIndex === 1 }]"
            ><view class="books-on-shelf"
              ><button
                v-for="topic in row"
                :key="topic.id"
                class="shelf-book-button"
                hover-class="shelf-book-pressed"
                :aria-label="`打开${topic.id === 'muscle' ? '薄肌圣经' : topic.title}`"
                @tap="openTopic(topic.id)"
              >
                <BookCover :topic="topic.id" /><text class="shelf-book-label">{{
                  topic.id === 'muscle' ? '薄肌圣经' : topic.title
                }}</text
                ><text class="shelf-book-caption"
                  >{{ topic.id === 'muscle' ? '8 章圣经' : '8 篇指南' }} ·
                  {{ progress(topic.id).count }} 已读</text
                ><view class="shelf-read-progress"
                  ><view :style="{ width: progress(topic.id).percent + '%' }"
                /></view></button></view
            ><view class="wooden-shelf"
              ><view /><text>0{{ rowIndex + 1 }}</text></view
            ></view
          ><view class="bookcase-base" />
        </view>
        <text class="section-title">薄肌养成工作台</text>
        <view class="practice-shortcuts"
          ><button @tap="navigateTo('/pages/lean-muscle/LeanMusclePage')">
            <text class="shortcut-title">今日安排</text><text>按自己的节奏练 →</text></button
          ><button @tap="navigateTo('/pages/lean-muscle/LeanMusclePage?tab=training')">
            <text class="shortcut-title">记录训练</text><text>动作、次数与感受 →</text></button
          ><button @tap="navigateTo('/pages/lean-muscle/LeanMusclePage?tab=score')">
            <text class="shortcut-title">本周评分</text><text>查看记录与依据 →</text></button
          ><button @tap="openTopic('muscle', true)">
            <text class="shortcut-title">实用指南</text><text>居家、饮食与复盘 →</text>
          </button></view
        >
        <view class="panel library-reading-note"
          ><view
            ><text class="section-title">读懂一页，做成一件事</text
            ><text class="muted"
              >每篇有步骤、检查方法和出处。读完可标记进度，加入行动后安排日期，留下自己的执行与复盘。</text
            ></view
          ><image :src="workspaceScene" class="library-workspace-art" mode="aspectFit"
        /></view>
      </template>
      <template v-else-if="tab === 'reading'">
        <view
          v-if="currentTopic"
          class="topic-reading-banner"
          :style="{ '--topic-wash': currentTopic.wash }"
          ><image
            v-if="currentCover"
            :src="currentCover"
            class="topic-mini-cover"
            mode="aspectFit"
          /><view class="topic-reading-copy"
            ><text class="topic-reading-heading">{{ currentTopic.headline }}</text
            ><text class="topic-reading-summary">{{ currentTopic.summary }}</text
            ><button class="topic-reading-source" @tap="copyTopicSource">
              复制原始资料链接 ↗
            </button></view
          ></view
        >
        <view class="library-search"
          ><input
            v-model="query"
            placeholder="搜索主题、操作或遇到的问题"
            confirm-type="search"
          /><button v-if="query" class="quiet-button" @tap="query = ''">清除</button></view
        >
        <view class="topic-filter"
          ><view class="filter-track"
            ><button :class="{ chosen: topicFilter === 'all' }" @tap="topicFilter = 'all'">
              全部</button
            ><button
              v-for="topic in topics"
              :key="topic.id"
              :class="{ chosen: topicFilter === topic.id }"
              :aria-label="`筛选${topic.title}`"
              @tap="topicFilter = topic.id"
            >
              {{ shortTitle(topic.id) }}
            </button></view
          ></view
        >
        <view class="library-view-filters"
          ><button
            v-for="filter in readingFilters"
            :key="filter.id"
            :class="{ chosen: readingFilter === filter.id }"
            @tap="readingFilter = filter.id"
          >
            {{ filter.title }}</button
          ><text>{{ displayed.length }} 篇</text></view
        >
        <view v-if="!displayed.length" class="panel library-empty"
          ><image :src="workspaceScene" mode="aspectFit" /><text class="section-title"
            >暂时没有匹配的章节</text
          ><text class="muted">可以换一个问题搜索，或清除未读与收藏条件。</text
          ><button class="secondary" @tap="clearFilters">
            查看{{ topicFilter === 'all' ? '全部' : '本书' }}章节
          </button></view
        >
        <button
          v-for="guide in displayed"
          :key="guide.id"
          class="guide-card library-chapter"
          :style="{ '--guide-accent': topicColor(guide.topic) }"
          @tap="openGuide(guide.id)"
        >
          <view class="chapter-index">{{
            String(chapterPosition(guide).number).padStart(2, '0')
          }}</view
          ><view class="chapter-card-copy"
            ><view class="guide-card-top"
              ><text class="guide-topic" :style="{ color: topicColor(guide.topic) }">{{
                topicTitle(guide.topic)
              }}</text
              ><text class="chapter-reading-state">{{
                library.completedGuideIds.includes(guide.id)
                  ? '已读完'
                  : library.bookmarks.includes(guide.id)
                    ? '已收藏'
                    : '阅读 →'
              }}</text></view
            ><text class="guide-card-title">{{ guide.title }}</text
            ><text class="guide-card-subtitle">{{ guide.subtitle }}</text
            ><view class="guide-card-bottom"
              ><text>{{ guide.level || '起步' }} · 约 {{ readingMinutes(guide) }} 分钟阅读</text
              ><text>{{ actionStepsFor(guide).length }} 步实践</text></view
            ></view
          >
        </button>
      </template>
      <template v-else>
        <view class="panel execution-intro"
          ><view
            ><text class="section-title">你的行动手账</text
            ><text class="muted"
              >安排日期，记录执行与结果。把书里的启发，留成自己的经验。</text
            ></view
          ><image :src="workspaceScene" class="library-workspace-art" mode="aspectFit"
        /></view>
        <view class="execution-filters"
          ><button
            v-for="filter in actionFilters"
            :key="filter.id"
            :class="{ chosen: actionFilter === filter.id }"
            @tap="actionFilter = filter.id"
          >
            {{ filter.title }}
            {{
              filter.id === 'all'
                ? library.actions.length
                : library.actions.filter((a) => a.done === (filter.id === 'done')).length
            }}
          </button></view
        >
        <view v-if="!visibleActions.length" class="panel library-empty"
          ><text class="section-title">{{
            library.actions.length ? '这个列表还没有行动' : '从一篇指南开始'
          }}</text
          ><text class="muted">{{
            library.actions.length
              ? '可以切换筛选，回看已完成与进行中的记录。'
              : '挑一个适合自己的问题，读完加入行动，再按自己的节奏完成。'
          }}</text
          ><button
            class="secondary"
            @tap="library.actions.length ? (actionFilter = 'all') : (tab = 'reading')"
          >
            {{ library.actions.length ? '查看全部行动' : '挑一篇指南' }}
          </button></view
        >
        <view
          v-for="action in library.actions"
          v-show="actionFilter === 'all' || action.done === (actionFilter === 'done')"
          :id="`action-${action.guideId}`"
          :key="actionAccount + ':' + action.guideId"
          ><GuideActionCard
            :action="action"
            :draft="actionDrafts[action.guideId]"
            :focused="focusedAction === action.guideId"
            @changed="onActionSaved"
            @draft="actionDrafts[action.guideId] = $event"
            @remove="removeAction"
        /></view>
        <text class="note">行动完成由你确认。健康记录与薄肌评分仍在对应模块中保存。</text>
      </template>
    </view>
    <view class="library-footer"
      ><text>资料核对 {{ REVIEWED_AT }} · 阅读进度由你确认</text
      ><text
        >人物观点、官方资料与产品实践分别注明。人生指南选编保留原出处、CC BY 4.0 和改编说明。</text
      ></view
    >
  </view>
</template>
<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import AppNavBar from '../../components/AppNavBar.vue';
import BookCover from './BookCover.vue';
import GuideActionCard from './GuideActionCard.vue';
import {
  topics,
  guides,
  findGuides,
  getGuide,
  REVIEWED_AT,
} from '../../features/version-answer/content.js';
import type { TopicId } from '../../features/version-answer/types.js';
import { bookCovers } from '../../features/version-answer/book-art.js';
import { versionEntryScene } from '../../features/version-answer/art.js';
import { workspaceScene } from '../../features/version-answer/workspace-art.js';
import { topicReading } from '../../features/version-answer/reading.js';
import {
  actionStepsFor,
  readingMinutes,
  chapterPosition,
  bookProgress,
} from '../../features/version-answer/learning.js';
import {
  loadLibrary,
  removeGuideAction,
  type ActionDetails,
  type Library,
} from '../../features/version-answer/store.js';
import {
  consumeLibraryDestination,
  type LibraryDestination,
} from '../../features/version-answer/navigation.js';
import { scrollToReadingSection } from '../../components/reading-navigation.js';
import { userStorageKey } from '../../features/auth/user-storage.js';
import { navigateTo } from '../../utils/router.js';
const tabs = [
  { id: 'topics', title: '书柜' },
  { id: 'reading', title: '全部章节' },
  { id: 'actions', title: '我的行动' },
];
const tab = ref('topics');
const query = ref('');
const topicFilter = ref('all');
const readingFilter = ref('all');
const actionFilter = ref('all');
const focusedAction = ref('');
const library = ref(loadLibrary());
const error = ref('');
const actionAccount = ref(userStorageKey('heban.version-answer.v1'));
const actionDrafts = ref<Record<string, ActionDetails>>({});
let initialDestination: LibraryDestination | null = null;
const readingFilters = [
  { id: 'all', title: '全部' },
  { id: 'unread', title: '未读' },
  { id: 'saved', title: '收藏' },
];
const actionFilters = [
  { id: 'all', title: '全部' },
  { id: 'active', title: '进行中' },
  { id: 'done', title: '已完成' },
];
const shelfRows = [topics.slice(0, 3), topics.slice(3)];
const topicTitle = (id: string) => topics.find((t) => t.id === id)?.title || '';
const topicColor = (id: string) => topics.find((t) => t.id === id)?.color || '#8c775b';
const shortTitle = (id: TopicId) =>
  ({ muscle: '薄肌', sun: '孙学', water: '饮水', codex: 'Codex', life: '人生' })[id];
const currentTopic = computed(() =>
  topics.some((t) => t.id === topicFilter.value)
    ? topicReading[topicFilter.value as TopicId]
    : null,
);
const currentCover = computed(() => bookCovers[topicFilter.value as TopicId] || '');
const displayed = computed(() =>
  findGuides({ topic: topicFilter.value, query: query.value }).filter((g) =>
    readingFilter.value === 'unread'
      ? !library.value.completedGuideIds.includes(g.id)
      : readingFilter.value === 'saved'
        ? library.value.bookmarks.includes(g.id)
        : true,
  ),
);
const visibleActions = computed(() =>
  library.value.actions.filter(
    (a) => actionFilter.value === 'all' || a.done === (actionFilter.value === 'done'),
  ),
);
const completedCount = computed(
  () => library.value.completedGuideIds.length + library.value.completedBibleIds.length,
);
const pendingActions = computed(() => library.value.actions.filter((a) => !a.done).length);
const progress = (topic: TopicId) => bookProgress(topic, library.value);
function openGuide(id: string) {
  navigateTo(`/pages/version-answer/GuidePage?id=${encodeURIComponent(id)}`);
}
function clearFilters() {
  query.value = '';
  readingFilter.value = 'all';
}
function openTopic(id: TopicId, guideOnly = false) {
  clearFilters();
  if (id === 'muscle' && !guideOnly) {
    navigateTo('/pages/lean-muscle/LeanMusclePage?tab=bible');
    return;
  }
  topicFilter.value = id;
  tab.value = 'reading';
}
function copyTopicSource() {
  if (currentTopic.value)
    uni.setClipboardData({
      data: currentTopic.value.sourceUrl,
      success: () => uni.showToast({ title: '出处链接已复制', icon: 'none' }),
      fail: () => {
        error.value = '复制失败，请重试';
      },
    });
}
function onActionSaved(state: Library, id: string) {
  library.value = state;
  delete actionDrafts.value[id];
}
function removeAction(id: string) {
  uni.showModal({
    title: '移除这项行动？',
    content: '执行笔记将一并移除，指南、收藏和阅读进度会保留。',
    success: ({ confirm }) => {
      if (!confirm) return;
      try {
        library.value = removeGuideAction(id);
        delete actionDrafts.value[id];
        error.value = '';
      } catch {
        error.value = '移除失败，请重试';
      }
    },
  });
}
function applyDestination(destination: LibraryDestination) {
  tab.value = destination.tab;
  query.value = '';
  readingFilter.value = 'all';
  if (destination.topic) topicFilter.value = destination.topic;
  if (destination.focus) {
    focusedAction.value = destination.focus;
    actionFilter.value = 'all';
    nextTick(() => scrollToReadingSection(`#action-${destination.focus}`, () => {}));
  }
}
onLoad((params) => {
  const candidate = params?.tab;
  if (candidate === 'reading' || candidate === 'actions' || candidate === 'topics')
    tab.value = candidate;
  if (params?.topic && topics.some((t) => t.id === params.topic)) {
    topicFilter.value = params.topic;
    tab.value = 'reading';
  }
  initialDestination = {
    tab: tab.value as LibraryDestination['tab'],
    topic: topics.some((t) => t.id === topicFilter.value)
      ? (topicFilter.value as TopicId)
      : undefined,
  };
  if (params?.focus && getGuide(params.focus)) {
    focusedAction.value = params.focus;
    initialDestination = { tab: 'actions', focus: params.focus };
    actionFilter.value = 'all';
  }
});
onShow(() => {
  const account = userStorageKey('heban.version-answer.v1');
  if (account !== actionAccount.value) {
    actionAccount.value = account;
    actionDrafts.value = {};
    focusedAction.value = '';
    query.value = '';
    error.value = '';
  }
  library.value = loadLibrary();
  const destination = consumeLibraryDestination() || initialDestination;
  initialDestination = null;
  if (destination) applyDestination(destination);
});
</script>
