<template>
  <view :class="['hint', presentation.className]" @tap="$emit('tap')">
    <image class="avatar" src="/static/illustrations/xuxu-avatar.png" mode="aspectFill" />
    <view class="copy"
      ><text class="name">{{ presentation.name }}</text
      ><text class="message">{{ message }}</text></view
    >
    <view v-if="action" class="action"
      ><text>{{ action }}</text
      ><image src="/static/icons/forward.svg" mode="aspectFit"
    /></view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { companionPresentation } from './companion-presentation.js';

const props = withDefaults(
  defineProps<{ message: string; action?: string; variant?: 'sunny' | 'note' | 'complete' }>(),
  { variant: 'sunny' },
);
const presentation = computed(() => companionPresentation(props.variant));
defineEmits<{ tap: [] }>();
</script>

<style scoped>
.hint {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 18rpx;
  border: 2rpx solid #eee0b5;
  border-radius: 18rpx;
  background: #fffbed;
}
.hint--note {
  border-color: #d9e8dc;
  background: #f2f8f2;
}
.hint--complete {
  border-color: #cbe5d1;
  background: #eaf6ec;
}
.avatar {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #f8e3a0;
}
.copy {
  flex: 1;
  min-width: 0;
}
.name,
.message {
  display: block;
}
.name {
  color: #75613b;
  font-size: 22rpx;
  font-weight: 700;
}
.message {
  margin-top: 3rpx;
  color: #665f46;
  font-size: 23rpx;
  line-height: 1.45;
}
.action {
  display: flex;
  align-items: center;
  gap: 4rpx;
  color: #467e58;
  font-size: 22rpx;
  white-space: nowrap;
}
.action image {
  width: 28rpx;
  height: 28rpx;
}
</style>
