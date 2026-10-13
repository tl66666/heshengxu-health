<template>
  <view class="library-bridge">
    <view class="library-bridge-head"
      ><view
        ><text class="library-bridge-title">{{
          compact ? '我的成长书柜' : '从书柜带来的行动'
        }}</text
        ><text class="library-bridge-copy">{{
          compact
            ? `阅读完成 ${readCount} · ${pending.length} 项行动进行中`
            : '一次性尝试与复盘留在书柜，需要持续打卡的事可以放进计划。'
        }}</text></view
      ><image :src="workspaceScene" mode="aspectFit"
    /></view>
    <template v-if="!compact"
      ><button
        v-for="action in pending.slice(0, 2)"
        :key="action.guideId"
        class="library-bridge-action"
        @tap="openAction(action.guideId)"
      >
        <view
          ><text>{{ action.title }}</text
          ><text>{{
            action.dueDate ? `计划 ${action.dueDate.slice(5)}` : '暂未安排日期'
          }}</text></view
        ><text>查看 →</text></button
      ><text v-if="!pending.length" class="library-bridge-empty"
        >还没有进行中的行动，挑一篇指南开始。</text
      ></template
    >
    <view class="library-bridge-buttons"
      ><button @tap="navigateTo('/pages/version-answer/VersionAnswerPage')">打开书柜 →</button
      ><button @tap="navigateTo('/pages/version-answer/VersionAnswerPage?tab=actions')">
        {{ compact ? '行动与笔记' : '全部书柜行动' }}
      </button></view
    >
  </view>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { loadLibrary } from '../features/version-answer/store.js';
import { workspaceScene } from '../features/version-answer/workspace-art.js';
import { navigateTo } from '../utils/router.js';
defineProps<{ compact?: boolean }>();
const library = ref(loadLibrary());
onShow(() => {
  library.value = loadLibrary();
});
const pending = computed(() => library.value.actions.filter((a) => !a.done));
const readCount = computed(
  () => library.value.completedGuideIds.length + library.value.completedBibleIds.length,
);
function openAction(id: string) {
  navigateTo(`/pages/version-answer/VersionAnswerPage?tab=actions&focus=${encodeURIComponent(id)}`);
}
</script>
