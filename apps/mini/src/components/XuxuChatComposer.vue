<template>
  <view class="chat-shell">
    <view class="chat-head">
      <view class="avatar-frame">
        <image class="chat-avatar" src="/static/illustrations/xuxu-avatar.png" mode="aspectFill" />
      </view>
      <view class="chat-head-copy">
        <view class="chat-title-row">
          <text class="chat-name">序序</text>
          <view :class="['status-chip', `status-${connectionState}`]"><view class="status-dot" />{{ connectionStatusLabel }}</view>
        </view>
        <text class="chat-status">你的日常健康陪伴</text>
      </view>
      <text class="head-mark">陪伴</text>
    </view>

    <view class="chat-profile">
      <view class="profile-head">
        <view><text class="profile-title">健康画像</text><text class="profile-subtitle">让建议更贴近你的生活</text></view>
        <button class="profile-toggle" @tap="profileOpen = !profileOpen">{{ profileOpen ? '收起' : '展开' }}</button>
      </view>
      <view v-if="profileOpen" class="profile-tags">
        <text v-for="tag in profileTags" :key="tag" class="profile-tag">{{ tag }}</text>
      </view>
    </view>

    <scroll-view class="messages" scroll-y :scroll-into-view="lastMessageId">
      <view v-if="!messages.length && !typing" class="empty-chat">
        <image class="empty-illustration" src="/static/illustrations/xuxu-ai-empty.png" mode="aspectFit" />
        <text class="empty-kicker">今天也和序序说说吧</text>
        <text class="empty-title">从一个小问题开始，照顾好自己</text>
        <text class="empty-copy">饮食、睡眠、喝水和活动，都可以慢慢记录。</text>
      </view>
      <view v-for="message in messages" :id="message.id" :key="message.id" :class="['message', message.role, { 'message-error': message.id.startsWith('assistant-error') }]">
        <image v-if="message.role === 'assistant'" class="message-avatar" src="/static/illustrations/xuxu-avatar.png" mode="aspectFill" />
        <view class="message-body">
          <text v-if="message.role === 'assistant'" class="message-label">序序</text>
          <text class="message-text">{{ message.text }}</text>
          <button v-if="message.id.startsWith('assistant-error')" class="retry-message" @tap="retryLast">再试一次</button>
          <view v-if="message.sourceTitle" class="source-card"><image src="/static/icons/svg/journal.svg" mode="aspectFit" /><text>参考 · {{ message.sourceTitle }}</text></view>
        </view>
      </view>
      <view v-if="typing" class="message assistant typing-row">
        <image class="message-avatar" src="/static/illustrations/xuxu-avatar.png" mode="aspectFill" />
        <view class="typing"><text /><text /><text /></view>
      </view>
    </scroll-view>

    <scroll-view class="quick" scroll-x show-scrollbar="false">
      <text class="quick-label">可以聊聊</text>
      <button v-for="item in quickQuestions" :key="item.id" @tap="send(item.label)">{{ item.label }}</button>
    </scroll-view>

    <view class="composer">
      <button class="icon-button" aria-label="语音输入" @tap="voiceNotice"><image src="/static/icons/svg/mic.svg" mode="aspectFit" /></button>
      <input v-model="draft" confirm-type="send" placeholder="输入你想聊的事…" @confirm="send(draft)" />
      <button class="send" :class="{ enabled: draft.trim() }" :disabled="!draft.trim() || typing" aria-label="发送" @tap="send(draft)"><image src="/static/icons/svg/send.svg" mode="aspectFit" /></button>
    </view>
    <text class="disclaimer">序序提供健康管理与生活方式建议，不能替代医生诊疗。</text>
  </view>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { healthLoopState } from '../features/health-loop/health-loop.store.js';
import { createOfflineReply, createUserMessage, quickQuestions, type ChatMessage } from './xuxu-chat.js';
import { chatWithXuxu } from '../features/xuxu/xuxu.service.js';

const messages = ref<ChatMessage[]>([]);
const draft = ref('');
const typing = ref(false);
const connectionState = ref<'ready' | 'thinking' | 'retry'>('ready');
const profileOpen = ref(true);
const lastMessageId = computed(() => messages.value.at(-1)?.id || '');
const profileTags = computed(() => {
  const today = healthLoopState.today.value;
  return [today?.displayName || '新朋友', today?.activePlan?.kind === 'sleep' ? '睡眠与精力' : today?.activePlan ? '体重管理' : '从一个小目标开始'];
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
    const result = await chatWithXuxu(messages.value.map((message) => ({ role: message.role, content: message.text })));
    messages.value.push({ id: `assistant-${Date.now()}`, role: 'assistant', text: result.message.content });
    connectionState.value = 'ready';
  } catch (error) {
    console.error('序序聊天失败:', error);
    // API 不可用时仍给出明确、可执行的陪伴建议，不让输入停在“无响应”。
    messages.value.push(createOfflineReply(text));
    connectionState.value = 'retry';
  } finally {
    typing.value = false;
  }
}

const connectionStatusLabel = computed(() => connectionState.value === 'thinking' ? '正在回复' : connectionState.value === 'retry' ? '离线陪伴' : '随时可聊');
function voiceNotice() { uni.showToast({ title: '语音输入正在准备中，先试试打字吧', icon: 'none' }); }
function retryLast() { const last = [...messages.value].reverse().find((message) => message.role === 'user'); if (last) send(last.text); }
</script>

<style scoped>
.chat-shell{display:flex;flex:1 1 auto;width:100%;min-width:0;min-height:0;overflow:hidden;flex-direction:column;padding:20rpx 0 12rpx;box-sizing:border-box;background:#fffdf5;color:#294438}
.chat-head{display:flex;align-items:center;gap:16rpx;min-height:84rpx;padding:0 28rpx 18rpx;border-bottom:1rpx solid rgba(215,228,218,.72)}
.avatar-frame{display:flex;align-items:center;justify-content:center;width:76rpx;height:76rpx;flex:none;overflow:hidden;border:1rpx solid #e7d992;border-radius:24rpx;background:#fffdf5;box-shadow:0 8rpx 22rpx rgba(99,122,87,.12)}
.chat-avatar{width:76rpx;height:76rpx;border-radius:22rpx;mix-blend-mode:multiply}
.chat-head-copy{flex:1;min-width:0}.chat-title-row{display:flex;align-items:center;gap:12rpx}.chat-name{color:#203d31;font-size:32rpx;font-weight:800;letter-spacing:1rpx}.chat-status{display:block;margin-top:7rpx;color:#829589;font-size:21rpx}.head-mark{align-self:flex-start;padding-top:8rpx;color:#9bad9f;font-size:19rpx;letter-spacing:2rpx}
.status-chip{display:flex;align-items:center;gap:6rpx;padding:5rpx 12rpx;border:1rpx solid #d8eadc;border-radius:99rpx;color:#5c8869;background:#f4fbf3;font-size:18rpx;font-weight:700}.status-dot{width:10rpx;height:10rpx;border-radius:50%;background:#6eb47b;box-shadow:0 0 0 4rpx rgba(110,180,123,.14)}.status-thinking{color:#8f7a49;border-color:#f0e3bb;background:#fffaf0}.status-thinking .status-dot{background:#d7ad56}.status-retry{color:#9c6c5d;border-color:#f0dcd4;background:#fff7f4}.status-retry .status-dot{background:#d58c73}
.chat-profile{margin:14rpx 28rpx 0;padding:16rpx 18rpx 15rpx;border:1rpx solid #e6eee6;border-radius:22rpx;background:rgba(255,255,255,.82);box-shadow:0 8rpx 24rpx rgba(92,119,98,.06)}.profile-head{display:flex;align-items:center;justify-content:space-between}.profile-title{display:block;color:#547464;font-size:23rpx;font-weight:700}.profile-subtitle{display:block;margin-top:4rpx;color:#9aaba0;font-size:18rpx}.profile-toggle{padding:4rpx 8rpx;color:#6b9277;background:transparent;font-size:20rpx}.profile-tags{display:flex;flex-wrap:wrap;gap:10rpx;margin-top:13rpx}.profile-tag{padding:7rpx 13rpx;border:1rpx solid #e1ebe1;border-radius:14rpx;color:#688273;background:#fbfefa;font-size:20rpx}
.messages{flex:1;width:100%;height:0;min-height:0;box-sizing:border-box;padding:22rpx 28rpx 18rpx}.empty-chat{display:flex;align-items:center;flex-direction:column;padding:34rpx 14rpx 28rpx;text-align:center}.empty-illustration{display:block;width:300rpx;height:220rpx;margin:0 auto 8rpx;mix-blend-mode:multiply}.empty-kicker{margin-top:2rpx;color:#7d9b83;font-size:21rpx;font-weight:700}.empty-title{margin-top:9rpx;color:#294d3b;font-size:28rpx;font-weight:800}.empty-copy{max-width:520rpx;margin-top:9rpx;color:#91a296;font-size:21rpx;line-height:1.55}
.message{display:flex;align-items:flex-start;gap:13rpx;margin:18rpx 0}.message.assistant{padding-right:26rpx}.message.user{justify-content:flex-end;padding-left:26rpx}.message-avatar{width:48rpx;height:48rpx;flex:none;border:1rpx solid #e6d88c;border-radius:15rpx;background:#fffdf5;mix-blend-mode:multiply}.message-body{max-width:calc(100% - 62rpx);min-width:0}.message-label{display:block;margin:0 0 5rpx 6rpx;color:#91a293;font-size:18rpx;font-weight:700}.message-text{display:block;max-width:100%;word-break:break-word;padding:15rpx 18rpx;border:1rpx solid #e0eee2;border-radius:8rpx 22rpx 22rpx 22rpx;color:#315141;background:rgba(249,255,249,.95);box-shadow:0 5rpx 16rpx rgba(76,110,83,.07);font-size:24rpx;line-height:1.62}.message.user .message-text{border-color:#dcebf1;border-radius:22rpx 8rpx 22rpx 22rpx;color:#3b5f70;background:#f2f9fc;box-shadow:0 5rpx 16rpx rgba(75,119,138,.06)}.source-card{display:flex;align-items:center;gap:6rpx;margin-top:9rpx;padding:9rpx 12rpx;border:1rpx solid #e7ece6;border-radius:13rpx;color:#819587;background:rgba(255,255,255,.8);font-size:18rpx}.source-card image{width:24rpx;height:24rpx;opacity:.7}.retry-message{margin:8rpx 0 0 4rpx;padding:4rpx 12rpx;border:1rpx solid #ead5cc;border-radius:12rpx;color:#a06f60;background:#fffdfb;font-size:19rpx;line-height:32rpx}
.typing{display:flex;align-items:center;gap:5rpx;height:52rpx;padding:0 18rpx;border:1rpx solid #e0eee2;border-radius:8rpx 22rpx 22rpx 22rpx;background:#f9fff9}.typing text{width:9rpx;height:9rpx;border-radius:50%;background:#9cc2a4;animation:breathe 1.1s ease-in-out infinite}.typing text:nth-child(2){animation-delay:.14s}.typing text:nth-child(3){animation-delay:.28s}@keyframes breathe{0%,100%{opacity:.35;transform:translateY(0)}50%{opacity:1;transform:translateY(-3rpx)}}
.quick{display:flex;flex:none;width:100%;box-sizing:border-box;padding:13rpx 28rpx 10rpx;border-top:1rpx solid rgba(220,233,222,.72);background:rgba(255,255,255,.7);white-space:nowrap}.quick-label{display:inline-flex;align-items:center;height:52rpx;margin-right:10rpx;color:#93a298;font-size:19rpx;white-space:nowrap}.quick button{display:inline-block;height:52rpx;margin-right:10rpx;padding:0 17rpx;border:1rpx solid #deebe0;border-radius:17rpx;color:#5b8067;background:#fcfffb;box-shadow:0 4rpx 12rpx rgba(81,113,86,.05);font-size:21rpx;line-height:50rpx}
.composer{display:flex;align-items:center;gap:11rpx;flex:none;padding:8rpx 28rpx 0}.icon-button{display:flex;align-items:center;justify-content:center;width:52rpx;height:68rpx;flex:none;border-radius:18rpx;background:transparent}.icon-button image{width:32rpx;height:32rpx;opacity:.72}.composer input{flex:1;min-width:0;height:70rpx;padding:0 22rpx;border:1rpx solid #e4eee5;border-radius:22rpx;color:#284b37;background:rgba(255,255,255,.94);box-shadow:inset 0 1rpx 0 rgba(255,255,255,.9),0 6rpx 16rpx rgba(70,101,76,.06);font-size:24rpx}.send{display:flex;align-items:center;justify-content:center;width:68rpx;height:68rpx;flex:none;border-radius:22rpx;background:#e4eee5}.send.enabled{border:1rpx solid #c3dfc8;background:#e9f6eb;box-shadow:0 8rpx 18rpx rgba(77,133,87,.13)}.send image{width:31rpx;height:31rpx}.disclaimer{display:block;padding:10rpx 28rpx 2rpx;color:#9aa99f;text-align:center;font-size:17rpx}
</style>
