<template>
  <view v-if="guide" class="detail-reading-card">
    <view
      ><text class="detail-reading-kicker">阅读与下一步</text
      ><text class="detail-reading-title">{{ heading || guide.title }}</text
      ><text class="detail-reading-copy">{{ guide.subtitle }}</text></view
    >
    <button @tap="navigateTo(`/pages/version-answer/GuidePage?id=${guide.id}`)">读一页 →</button>
  </view>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { getGuide } from '../features/version-answer/content.js';
import { navigateTo } from '../utils/router.js';
const props = defineProps<{ guideId: string; heading?: string }>();
const guide = computed(() => getGuide(props.guideId));
</script>
