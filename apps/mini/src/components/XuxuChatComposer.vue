<template>
  <view class="chat-shell">
    <view class="chat-head">
      <image class="chat-avatar" src="/static/illustrations/xuxu-avatar.jpg" mode="aspectFill" />
      <view class="chat-head-copy"
        ><text class="chat-name">序序</text
        ><view class="chat-status"><view class="status-dot" />在线 · 健康管理参考</view></view
      >
    </view>

    <view class="chat-profile">
      <view class="profile-head"
        ><text>健康画像</text
        ><button @tap="profileOpen = !profileOpen">
          {{ profileOpen ? '收起' : '展开' }}
        </button></view
      >
      <view v-if="profileOpen" class="profile-tags">
        <text v-for="tag in profileTags" :key="tag" class="profile-tag">{{ tag }}</text>
      </view>
    </view>

    <scroll-view class="messages" scroll-y :scroll-into-view="lastMessageId">
      <view v-if="!messages.length && !typing" class="empty-chat">
        <image src="/static/illustrations/xuxu-ai-empty.png" mode="aspectFit" />
        <text class="empty-title">今天想从哪里开始照顾自己？</text>
        <text class="empty-copy">可以问饮食、体重、睡眠、运动或情绪。</text>
      </view>
      <view
        v-for="message in messages"
        :id="message.id"
        :key="message.id"
        :class="['message', message.role]"
      >
        <image
          v-if="message.role === 'assistant'"
          class="message-avatar"
          src="/static/illustrations/xuxu-avatar.jpg"
          mode="aspectFill"
        />
        <view class="message-body">
          <text class="message-text">{{ message.text }}</text>
          <view v-if="message.sourceTitle" class="source-card"
            ><image src="/static/icons/journal.svg" mode="aspectFit" /><text
              >知识来源 · {{ message.sourceTitle }}</text
            ></view
          >
        </view>
      </view>
      <view v-if="typing" class="message assistant typing-row"
        ><image
          class="message-avatar"
          src="/static/illustrations/xuxu-avatar.jpg"
          mode="aspectFill" /><view class="typing"><text /><text /><text /></view
      ></view>
    </scroll-view>

    <scroll-view class="quick" scroll-x="true" show-scrollbar="false">
      <button v-for="item in quickQuestions" :key="item.id" @tap="send(item.label)">
        {{ item.label }}
      </button>
    </scroll-view>

    <view class="composer">
      <button class="icon-button" aria-label="语音输入" @tap="voiceNotice">
        <image src="/static/icons/mic.svg" mode="aspectFit" />
      </button>
      <input
        v-model="draft"
        confirm-type="send"
        placeholder="输入你的问题…"
        @confirm="send(draft)"
      />
      <button
        class="send"
        :class="{ enabled: draft.trim() }"
        :disabled="!draft.trim() || typing"
        aria-label="发送"
        @tap="send(draft)"
      >
        <image src="/static/icons/send.svg" mode="aspectFit" />
      </button>
    </view>
    <text class="disclaimer">序序提供健康管理与生活方式建议，不能替代医生诊疗。</text>
    <view class="safety">
      <image src="/static/illustrations/xuxu-safe-support.png" mode="aspectFit" />
      <view
        ><text>需要专业帮助时</text
        ><text>如果出现持续不适或紧急症状，请及时联系医生或当地急救服务。</text></view
      >
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { healthLoopState } from '../features/health-loop/health-loop.store.js';
import {
  createRuleReply,
  createUserMessage,
  quickQuestions,
  replySource,
  type ChatMessage,
} from './xuxu-chat.js';

const messages = ref<ChatMessage[]>([]);
const draft = ref('');
const typing = ref(false);
const profileOpen = ref(true);
const lastMessageId = computed(() => messages.value.at(-1)?.id || '');
const profileTags = computed(() => {
  const plan = healthLoopState.today.value?.activePlan;
  const name = healthLoopState.today.value?.displayName;
  return [
    name || '尚未建档',
    plan?.kind === 'sleep' ? '睡眠与精力' : plan ? '体重管理' : '从一个小目标开始',
  ];
});

function send(value: string) {
  const text = value.trim();
  if (!text || typing.value) return;
  messages.value.push(createUserMessage(text));
  draft.value = '';
  typing.value = true;
  nextTick(() => {
    setTimeout(() => {
      messages.value.push({
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: createRuleReply(text),
        sourceTitle: replySource(text),
      });
      typing.value = false;
    }, 420);
  });
}
function voiceNotice() {
  uni.showToast({ title: '语音输入后续开放，先试试打字', icon: 'none' });
}
</script>

<style scoped>
.chat-shell {
  display: flex;
  flex: 1 1 auto;
  width: auto;
  max-width: 100%;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  flex-direction: column;
  margin-top: 0;
  padding: 14rpx 0 10rpx;
  border: 1rpx solid #dceadd;
  border-radius: 18rpx;
  background: #fff;
}
.chat-head {
  display: flex;
  align-items: center;
  gap: 14rpx;
  padding: 0 18rpx 12rpx;
  border-bottom: 1rpx solid #eef4ee;
}
.chat-avatar {
  width: 58rpx;
  height: 58rpx;
  border: 3rpx solid #f0da8c;
  border-radius: 50%;
}
.chat-head-copy {
  min-width: 0;
}
.chat-name,
.chat-status {
  display: flex;
  align-items: center;
}
.chat-name {
  color: #244735;
  font-size: 28rpx;
  font-weight: 700;
}
.chat-status {
  gap: 6rpx;
  margin-top: 5rpx;
  color: #7a9180;
  font-size: 20rpx;
}
.status-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: #5ba56d;
}
.chat-profile {
  margin: 10rpx 18rpx 0;
  padding: 10rpx 12rpx;
  border-radius: 12rpx;
  background: #f1f8f1;
}
.profile-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #4f735d;
  font-size: 22rpx;
  font-weight: 700;
}
.profile-head button {
  color: #4f8a60;
  font-size: 20rpx;
}
.profile-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 9rpx;
}
.profile-tag {
  padding: 5rpx 10rpx;
  border-radius: 14rpx;
  color: #4e765c;
  background: #fff;
  font-size: 19rpx;
}
.messages {
  flex: 1;
  height: 0;
  min-height: 0;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 12rpx 18rpx;
}
.empty-chat {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 24rpx 0;
  text-align: center;
}
.empty-chat image {
  width: 128rpx;
  height: 128rpx;
  margin-bottom: 12rpx;
}
.empty-title {
  color: #31543e;
  font-size: 24rpx;
  font-weight: 700;
}
.empty-copy {
  margin-top: 6rpx;
  color: #7b9180;
  font-size: 20rpx;
}
.message {
  display: flex;
  align-items: flex-start;
  gap: 10rpx;
  margin: 10rpx 0;
}
.message.assistant {
  padding-right: 38rpx;
}
.message.user {
  justify-content: flex-end;
  padding-left: 38rpx;
}
.message-avatar {
  width: 48rpx;
  height: 48rpx;
  flex: none;
  border-radius: 50%;
}
.message-body {
  max-width: calc(100% - 58rpx);
  min-width: 0;
}
.message-text {
  display: block;
  max-width: 100%;
  word-break: break-word;
  padding: 11rpx 14rpx;
  border-radius: 14rpx;
  color: #294a36;
  background: #f1f8f1;
  font-size: 23rpx;
  line-height: 1.55;
}
.message.user .message-text {
  color: #315a70;
  background: #edf5f8;
}
.source-card {
  display: flex;
  align-items: center;
  gap: 6rpx;
  margin-top: 7rpx;
  padding: 7rpx 9rpx;
  border: 1rpx solid #e2ebe3;
  border-radius: 9rpx;
  color: #789080;
  background: #fff;
  font-size: 18rpx;
}
.source-card image {
  width: 24rpx;
  height: 24rpx;
  opacity: 0.7;
}
.typing {
  display: flex;
  align-items: center;
  gap: 5rpx;
  height: 48rpx;
  padding: 0 16rpx;
  border-radius: 14rpx;
  background: #f1f8f1;
}
.typing text {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: #8db19a;
}
.quick {
  display: flex;
  flex: none;
  width: 100%;
  box-sizing: border-box;
  padding: 8rpx 18rpx;
  border-top: 1rpx solid #eef4ee;
  white-space: nowrap;
}
.quick button {
  display: inline-block;
  margin-right: 10rpx;
  padding: 9rpx 13rpx;
  border: 1rpx solid #dceadd;
  border-radius: 24rpx;
  color: #4f735d;
  background: #fff;
  font-size: 20rpx;
}
.composer {
  display: flex;
  align-items: center;
  gap: 10rpx;
  flex: none;
  padding: 0 18rpx;
}
.icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52rpx;
  height: 62rpx;
  flex: none;
}
.icon-button image {
  width: 34rpx;
  height: 34rpx;
}
.composer input {
  flex: 1;
  min-width: 0;
  height: 68rpx;
  padding: 0 20rpx;
  border-radius: 38rpx;
  color: #284b37;
  background: #f3f7f3;
  font-size: 25rpx;
}
.send {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 62rpx;
  height: 62rpx;
  flex: none;
  border-radius: 31rpx;
  background: #bdd4c1;
}
.send.enabled {
  background: #2e7d4f;
}
.send image {
  width: 34rpx;
  height: 34rpx;
}
.disclaimer {
  display: block;
  padding: 8rpx 18rpx 0;
  color: #8a9b90;
  text-align: center;
  font-size: 18rpx;
}
.safety {
  display: flex;
  align-items: center;
  gap: 10rpx;
  flex: none;
  margin: 8rpx 18rpx 0;
  padding: 8rpx 10rpx;
  border: 1rpx solid #e0e9e0;
  border-radius: 12rpx;
  background: #f5f9f4;
}
.safety image {
  width: 46rpx;
  height: 46rpx;
  flex: none;
}
.safety view {
  min-width: 0;
}
.safety text {
  display: block;
  color: #4b6f55;
  font-size: 19rpx;
  font-weight: 700;
}
.safety text:last-child {
  margin-top: 3rpx;
  color: #788e7e;
  font-size: 17rpx;
  font-weight: 400;
  line-height: 1.35;
}
</style>
