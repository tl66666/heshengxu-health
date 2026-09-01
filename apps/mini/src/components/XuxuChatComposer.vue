<template>
  <view class="chat-shell">
    <view class="chat-head">
      <view class="avatar-frame">
        <image class="chat-avatar" src="/static/illustrations/xuxu-avatar.png" mode="aspectFill" />
      </view>
      <view class="chat-head-copy"
        ><view class="chat-title-row"
          ><text class="chat-name">序序</text
          ><view :class="['status-chip', `status-${connectionState}`]"
            ><view class="status-dot" />{{ connectionStatusLabel }}</view
          ></view
        ><text class="chat-status">你的日常健康陪伴</text></view
      >
      <text class="head-mark">禾伴</text>
    </view>

    <view class="chat-profile">
      <view class="profile-head"
        ><text>健康画像</text
        ><button class="profile-toggle" @tap="profileOpen = !profileOpen">
          {{ profileOpen ? '收起' : '展开' }}
        </button></view
      >
      <view v-if="profileOpen" class="profile-tags">
        <text v-for="tag in profileTags" :key="tag" class="profile-tag">{{ tag }}</text>
      </view>
    </view>

    <scroll-view class="messages" scroll-y :scroll-into-view="lastMessageId">
      <view v-if="!messages.length && !typing" class="empty-chat">
        <view class="empty-illustration">
          <image src="/static/illustrations/xuxu-ai-empty.png" mode="aspectFit" />
        </view>
        <text class="empty-kicker">今天也和序序打个招呼吧</text>
        <text class="empty-title">从一个小问题开始，照顾好自己</text>
        <text class="empty-copy">饮食、睡眠、喝水和活动，都可以慢慢记录。</text>
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
          src="/static/illustrations/xuxu-avatar.png"
          mode="aspectFill"
        />
        <view class="message-body">
          <text v-if="message.role === 'assistant'" class="message-label">序序</text>
          <text class="message-text">{{ message.text }}</text>
          <view v-if="message.sourceTitle" class="source-card"
            ><image src="/static/icons/svg/journal.svg" mode="aspectFit" /><text
              >知识来源 · {{ message.sourceTitle }}</text
            ></view
          >
        </view>
      </view>
      <view v-if="typing" class="message assistant typing-row"
        ><image
          class="message-avatar"
          src="/static/illustrations/xuxu-avatar.png"
          mode="aspectFill" /><view class="typing"><text /><text /><text /></view
      ></view>
    </scroll-view>

    <scroll-view class="quick" scroll-x="true" show-scrollbar="false">
      <text class="quick-label">可以聊聊</text>
      <button v-for="item in quickQuestions" :key="item.id" @tap="send(item.label)">
        {{ item.label }}
      </button>
    </scroll-view>

    <view class="composer">
      <button class="icon-button" aria-label="语音输入" @tap="voiceNotice">
        <image src="/static/icons/svg/mic.svg" mode="aspectFit" />
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
        <image src="/static/icons/svg/send.svg" mode="aspectFit" />
      </button>
    </view>
    <text class="disclaimer">序序提供健康管理与生活方式建议，不能替代医生诊疗。</text>
  </view>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { healthLoopState } from '../features/health-loop/health-loop.store.js';
import {
  classifyXuxuError,
  createUserMessage,
  quickQuestions,
  type ChatMessage,
} from './xuxu-chat.js';
import { chatWithXuxu } from '../features/xuxu/xuxu.service.js';

const messages = ref<ChatMessage[]>([]);
const draft = ref('');
const typing = ref(false);
const connectionState = ref<'ready' | 'thinking' | 'retry'>('ready');
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

async function send(value: string) {
  const text = value.trim();
  if (!text || typing.value) return;
  messages.value.push(createUserMessage(text));
  draft.value = '';
  typing.value = true;
  connectionState.value = 'thinking';
  await nextTick();
  try {
    const result = await chatWithXuxu(
      messages.value.map((message) => ({ role: message.role, content: message.text })),
    );
    messages.value.push({
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      text: result.message.content,
    });
    connectionState.value = 'ready';
  } catch (error) {
    console.error('序序聊天失败:', error);
    connectionState.value = 'retry';
    messages.value.push({
      id: `assistant-error-${Date.now()}`,
      role: 'assistant',
      text: errorMessage(error),
    });
  } finally {
    typing.value = false;
  }
}

const connectionStatusLabel = computed(() => {
  if (connectionState.value === 'thinking') return '正在回复';
  if (connectionState.value === 'retry') return '稍后重试';
  return '随时可聊';
});
function voiceNotice() {
  uni.showToast({ title: '语音输入后续开放，先试试打字', icon: 'none' });
}

function errorMessage(error: unknown) {
  const kind = classifyXuxuError(error);
  if (kind === 'network') return '消息还在路上，网络有点慢。请检查网络后再试一次。';
  if (kind === 'auth') return '登录状态已过期，重新进入小程序后再和序序聊聊。';
  if (kind === 'service') return '序序正在整理回答，稍后再试一次就好。';
  return '这条消息没有送达，稍后再试一次就好。';
}
</script>

<style scoped>
.chat-shell {
  display: flex;
  flex: 1 1 auto;
  width: 100%;
  max-width: 100%;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  flex-direction: column;
  padding: 18rpx 0 10rpx;
  border: 0;
  border-radius: 0;
  background: #f7fbf8;
}
.chat-head {
  display: flex;
  align-items: center;
  gap: 14rpx;
  padding: 0 24rpx 14rpx;
  border-bottom: 1rpx solid #e1ebe2;
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
  margin: 10rpx 24rpx 0;
  padding: 8rpx 0 10rpx;
  border-bottom: 1rpx solid #e5ede5;
  border-radius: 0;
  background: transparent;
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
  padding: 4rpx 9rpx;
  border: 1rpx solid #dfeadf;
  border-radius: 10rpx;
  color: #4e765c;
  background: #fdfefd;
  font-size: 19rpx;
}
.messages {
  flex: 1;
  height: 0;
  min-height: 0;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 16rpx 24rpx;
}
.empty-chat {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 34rpx 0 24rpx;
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
  padding: 8rpx 24rpx;
  border-top: 1rpx solid #e1ebe2;
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
  padding: 0 24rpx;
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
  background: var(--hz-primary-soft);
  border: 2rpx solid var(--hz-primary-border);
  color: var(--hz-primary-ink);
  box-shadow: 0 8rpx 20rpx rgba(47, 124, 80, 0.1);
}
.send image {
  width: 34rpx;
  height: 34rpx;
}
.disclaimer {
  display: block;
  padding: 8rpx 24rpx 2rpx;
  color: #8a9b90;
  text-align: center;
  font-size: 18rpx;
}

/* Bright cream watercolor surface: soft depth without the gray wash of the old shell. */
.chat-shell {
  padding: 20rpx 0 12rpx;
  background: linear-gradient(180deg, #fffdf8 0%, #fffefa 42%, #f7fbf8 100%);
  color: #263f35;
}

.chat-head {
  gap: 16rpx;
  min-height: 84rpx;
  padding: 0 28rpx 18rpx;
  border-bottom: 1rpx solid rgba(215, 228, 218, 0.7);
}

.avatar-frame {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 76rpx;
  height: 76rpx;
  flex: none;
  overflow: hidden;
  border: 1rpx solid #e7d992;
  border-radius: 26rpx;
  background: #fff9dc;
  box-shadow: 0 8rpx 22rpx rgba(99, 122, 87, 0.13);
}

.chat-avatar {
  width: 72rpx;
  height: 72rpx;
  border: 0;
  border-radius: 22rpx;
}

.chat-head-copy {
  flex: 1;
}

.chat-title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.chat-name {
  color: #203d31;
  font-size: 32rpx;
  font-weight: 800;
  letter-spacing: 1rpx;
}

.status-chip {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 5rpx 12rpx;
  border: 1rpx solid #d8eadc;
  border-radius: 99rpx;
  color: #5c8869;
  background: #f4fbf3;
  font-size: 18rpx;
  font-weight: 700;
}

.status-dot {
  width: 10rpx;
  height: 10rpx;
  background: #6eb47b;
  box-shadow: 0 0 0 4rpx rgba(110, 180, 123, 0.14);
}

.status-thinking {
  color: #8f7a49;
  border-color: #f0e3bb;
  background: #fffaf0;
}

.status-thinking .status-dot {
  background: #d7ad56;
  box-shadow: 0 0 0 4rpx rgba(215, 173, 86, 0.14);
}

.status-retry {
  color: #9c6c5d;
  border-color: #f0dcd4;
  background: #fff7f4;
}

.status-retry .status-dot {
  background: #d58c73;
  box-shadow: 0 0 0 4rpx rgba(213, 140, 115, 0.14);
}

.chat-status {
  margin-top: 7rpx;
  color: #829589;
  font-size: 21rpx;
}

.head-mark {
  align-self: flex-start;
  padding-top: 8rpx;
  color: #b2c0b4;
  font-size: 19rpx;
  letter-spacing: 2rpx;
}

.chat-profile {
  margin: 14rpx 28rpx 0;
  padding: 16rpx 18rpx 15rpx;
  border: 1rpx solid #e6eee6;
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 8rpx 24rpx rgba(92, 119, 98, 0.06);
}

.profile-head {
  color: #547464;
  font-size: 23rpx;
}

.profile-toggle {
  padding: 4rpx 8rpx;
  color: #6b9277;
  font-size: 20rpx;
}

.profile-tags {
  gap: 10rpx;
  margin-top: 13rpx;
}

.profile-tag {
  padding: 7rpx 13rpx;
  border: 1rpx solid #e1ebe1;
  border-radius: 14rpx;
  color: #688273;
  background: #fbfefa;
  font-size: 20rpx;
}

.messages {
  padding: 22rpx 28rpx 18rpx;
}

.empty-chat {
  padding: 34rpx 14rpx 28rpx;
}

.empty-illustration {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 232rpx;
  height: 190rpx;
  margin-bottom: 8rpx;
  overflow: hidden;
  border-radius: 40rpx;
  background: #fffdf4;
}

.empty-illustration image {
  width: 232rpx;
  height: 232rpx;
  margin: 0;
  opacity: 0.96;
}

.empty-kicker {
  margin-top: 2rpx;
  color: #799a82;
  font-size: 21rpx;
  font-weight: 700;
}

.empty-title {
  margin-top: 9rpx;
  color: #294d3b;
  font-size: 28rpx;
  font-weight: 800;
}

.empty-copy {
  max-width: 520rpx;
  margin-top: 9rpx;
  color: #91a296;
  font-size: 21rpx;
  line-height: 1.55;
}

.message {
  gap: 13rpx;
  margin: 18rpx 0;
}

.message.assistant {
  padding-right: 26rpx;
}

.message.user {
  padding-left: 26rpx;
}

.message-avatar {
  width: 48rpx;
  height: 48rpx;
  border: 1rpx solid #e6d88c;
  border-radius: 16rpx;
  background: #fff9dc;
}

.message-body {
  max-width: calc(100% - 62rpx);
}

.message-label {
  display: block;
  margin: 0 0 5rpx 6rpx;
  color: #91a293;
  font-size: 18rpx;
  font-weight: 700;
}

.message-text {
  padding: 15rpx 18rpx;
  border: 1rpx solid #e0eee2;
  border-radius: 8rpx 22rpx 22rpx 22rpx;
  color: #315141;
  background: rgba(249, 255, 249, 0.95);
  box-shadow: 0 5rpx 16rpx rgba(76, 110, 83, 0.07);
  font-size: 24rpx;
  line-height: 1.62;
}

.message.user .message-text {
  border-color: #dcebf1;
  border-radius: 22rpx 8rpx 22rpx 22rpx;
  color: #3b5f70;
  background: #f2f9fc;
  box-shadow: 0 5rpx 16rpx rgba(75, 119, 138, 0.06);
}

.source-card {
  margin-top: 9rpx;
  padding: 9rpx 12rpx;
  border: 1rpx solid #e7ece6;
  border-radius: 13rpx;
  color: #819587;
  background: rgba(255, 255, 255, 0.8);
  font-size: 18rpx;
}

.typing {
  height: 52rpx;
  padding: 0 18rpx;
  border: 1rpx solid #e0eee2;
  border-radius: 8rpx 22rpx 22rpx 22rpx;
  background: #f9fff9;
}

.typing text {
  width: 9rpx;
  height: 9rpx;
  background: #9cc2a4;
  animation: breathe 1.1s ease-in-out infinite;
}

.typing text:nth-child(2) {
  animation-delay: 0.14s;
}
.typing text:nth-child(3) {
  animation-delay: 0.28s;
}

@keyframes breathe {
  0%,
  100% {
    opacity: 0.35;
    transform: translateY(0);
  }
  50% {
    opacity: 1;
    transform: translateY(-3rpx);
  }
}

.quick {
  gap: 10rpx;
  padding: 13rpx 28rpx 10rpx;
  border-top: 1rpx solid rgba(220, 233, 222, 0.72);
  background: rgba(255, 255, 255, 0.72);
}

.quick-label {
  display: inline-flex;
  align-items: center;
  height: 52rpx;
  margin-right: 2rpx;
  color: #93a298;
  font-size: 19rpx;
  white-space: nowrap;
}

.quick button {
  height: 52rpx;
  margin-right: 0;
  padding: 0 17rpx;
  border: 1rpx solid #deebe0;
  border-radius: 17rpx;
  color: #5b8067;
  background: #fcfffb;
  box-shadow: 0 4rpx 12rpx rgba(81, 113, 86, 0.05);
  font-size: 21rpx;
  line-height: 50rpx;
}

.composer {
  gap: 11rpx;
  padding: 8rpx 28rpx 0;
}

.icon-button {
  width: 52rpx;
  height: 68rpx;
  border-radius: 18rpx;
  background: transparent;
}

.icon-button image {
  width: 32rpx;
  height: 32rpx;
  opacity: 0.72;
}

.composer input {
  height: 70rpx;
  padding: 0 22rpx;
  border: 1rpx solid #e4eee5;
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.94);
  box-shadow:
    inset 0 1rpx 0 rgba(255, 255, 255, 0.9),
    0 6rpx 16rpx rgba(70, 101, 76, 0.06);
  font-size: 24rpx;
}

.send {
  width: 68rpx;
  height: 68rpx;
  border-radius: 22rpx;
  background: #e4eee5;
}

.send.enabled {
  border: 1rpx solid #c3dfc8;
  background: #e9f6eb;
  box-shadow: 0 8rpx 18rpx rgba(77, 133, 87, 0.13);
}

.send image {
  width: 31rpx;
  height: 31rpx;
}

.disclaimer {
  padding: 10rpx 28rpx 2rpx;
  color: #9aa99f;
  font-size: 17rpx;
}
</style>
