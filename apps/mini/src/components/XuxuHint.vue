<template>
  <view class="hint" @tap="$emit('tap')">
    <image class="avatar" src="/static/illustrations/xuxu-avatar.jpg" mode="aspectFill" />
    <view class="copy"
      ><text class="name">序序</text><text class="message">{{ message }}</text></view
    >
    <text v-if="action" class="action">{{ action }} ›</text>
  </view>
</template>

<script setup lang="ts">
defineProps<{ message: string; action?: string }>();
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
  color: #467e58;
  font-size: 22rpx;
  white-space: nowrap;
}
</style>
