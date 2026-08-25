<template>
  <view class="chat-shell">
    <view class="chat-head">
      <image src="/static/illustrations/xuxu-avatar.jpg" mode="aspectFill" />
      <view><text>序序</text><text>在线 · 只提供健康管理参考</text></view>
    </view>
    <view class="scope">我只会使用你主动记录并授权的健康信息，不会替代医生诊疗。</view>
    <scroll-view class="messages" scroll-y :scroll-into-view="lastMessageId">
      <view v-if="!messages.length" class="empty-chat">
        <image src="/static/illustrations/xuxu-ai-empty.png" mode="aspectFit" />
        <text>从一个问题开始吧</text>
        <text>你可以先点下面的快捷问题</text>
      </view>
      <view
        v-for="message in messages"
        :id="message.id"
        :key="message.id"
        :class="['message', message.role]"
      >
        <image
          v-if="message.role === 'assistant'"
          src="/static/illustrations/xuxu-avatar.jpg"
          mode="aspectFill"
        />
        <text>{{ message.text }}</text>
      </view>
    </scroll-view>
    <scroll-view class="quick" scroll-x>
      <button v-for="item in quickQuestions" :key="item.id" @tap="send(item.label)">
        {{ item.label }}
      </button>
    </scroll-view>
    <view class="composer">
      <input v-model="draft" confirm-type="send" placeholder="问问序序…" @confirm="send(draft)" />
      <button class="send" :disabled="!draft.trim()" aria-label="发送" @tap="send(draft)">
        发送
      </button>
    </view>
    <text class="disclaimer">序序的回答仅作生活方式参考，持续不适请寻求专业帮助。</text>
  </view>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import {
  createRuleReply,
  createUserMessage,
  quickQuestions,
  type ChatMessage,
} from './xuxu-chat.js';

const messages = ref<ChatMessage[]>([]);
const draft = ref('');
const lastMessageId = computed(() => messages.value.at(-1)?.id || '');

function send(value: string) {
  const text = value.trim();
  if (!text) return;
  messages.value.push(createUserMessage(text));
  draft.value = '';
  nextTick(() => {
    messages.value.push({
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      text: createRuleReply(text),
    });
  });
}
</script>

<style scoped>
.chat-shell {
  display: flex;
  min-height: calc(100vh - 260rpx);
  flex-direction: column;
  margin-top: 24rpx;
  padding: 18rpx 0 16rpx;
  border: 2rpx solid #dceadd;
  border-radius: 22rpx;
  background: #fff;
}
.chat-head {
  display: flex;
  align-items: center;
  gap: 14rpx;
  padding: 0 20rpx 16rpx;
  border-bottom: 2rpx solid #eef4ee;
}
.chat-head image {
  width: 70rpx;
  height: 70rpx;
  border: 3rpx solid #f0da8c;
  border-radius: 50%;
}
.chat-head text {
  display: block;
}
.chat-head text:first-child {
  color: #244735;
  font-size: 28rpx;
  font-weight: 700;
}
.chat-head text:last-child {
  margin-top: 5rpx;
  color: #7a9180;
  font-size: 20rpx;
}
.scope {
  margin: 14rpx 20rpx 0;
  padding: 12rpx 14rpx;
  border-radius: 12rpx;
  color: #547260;
  background: #f1f8f1;
  font-size: 21rpx;
  line-height: 1.45;
}
.messages {
  flex: 1;
  min-height: 410rpx;
  max-height: 620rpx;
  padding: 16rpx 20rpx;
}
.empty-chat {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 48rpx 0;
  color: #7b9180;
  font-size: 23rpx;
}
.empty-chat image {
  width: 180rpx;
  height: 180rpx;
  margin-bottom: 12rpx;
}
.empty-chat text:last-child {
  margin-top: 6rpx;
  font-size: 20rpx;
}
.message {
  display: flex;
  align-items: flex-start;
  gap: 10rpx;
  margin: 14rpx 0;
}
.message.assistant {
  padding-right: 48rpx;
}
.message.user {
  justify-content: flex-end;
  padding-left: 48rpx;
}
.message image {
  width: 48rpx;
  height: 48rpx;
  flex: none;
  border-radius: 50%;
}
.message text {
  padding: 14rpx 16rpx;
  border-radius: 16rpx;
  color: #294a36;
  background: #f1f8f1;
  font-size: 24rpx;
  line-height: 1.55;
}
.message.user text {
  color: #315a70;
  background: #edf5f8;
}
.quick {
  display: flex;
  padding: 12rpx 20rpx;
  white-space: nowrap;
  border-top: 2rpx solid #eef4ee;
}
.quick button {
  display: inline-block;
  margin-right: 10rpx;
  padding: 12rpx 16rpx;
  border: 2rpx solid #dceadd;
  border-radius: 24rpx;
  color: #4f735d;
  background: #fff;
  font-size: 21rpx;
}
.composer {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 0 20rpx;
}
.composer input {
  flex: 1;
  height: 76rpx;
  padding: 0 20rpx;
  border-radius: 38rpx;
  color: #284b37;
  background: #f3f7f3;
  font-size: 25rpx;
}
.send {
  width: 96rpx;
  height: 68rpx;
  border-radius: 34rpx;
  color: #fff;
  background: #2e7d4f;
  font-size: 23rpx;
  line-height: 68rpx;
}
.send[disabled] {
  opacity: 0.45;
}
.disclaimer {
  display: block;
  padding: 12rpx 20rpx 0;
  color: #8a9b90;
  text-align: center;
  font-size: 19rpx;
}
</style>
