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
        <view class="empty-medallion">
          <image class="empty-illustration" src="/static/illustrations/xuxu-record-reminder.png" mode="aspectFill" />
        </view>
        <text class="empty-kicker">今天也和序序说说吧</text>
        <text class="empty-title">从一个小问题开始，照顾好自己</text>
        <text class="empty-copy">饮食、睡眠、喝水和活动，都可以慢慢记录。</text>
      </view>
      <view v-for="message in messages" :id="message.id" :key="message.id" :class="['message', message.role, { 'message-error': message.id.startsWith('assistant-error') }]">
        <image v-if="message.role === 'assistant'" class="message-avatar" src="/static/illustrations/xuxu-avatar.png" mode="aspectFill" />
        <view class="message-body">
          <text v-if="message.role === 'assistant'" class="message-label">序序</text>
          <text class="message-text">{{ message.text }}</text>
          <button v-if="message.sourceTitle === '需要登录'" class="retry-message login-message" @tap="openLogin">去登录</button>
          <button v-if="message.id.startsWith('assistant-error') && message.sourceTitle !== '需要登录'" class="retry-message" @tap="retryLast">再试一次</button>
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
import { classifyXuxuError, createOfflineReply, createUserMessage, quickQuestions, type ChatMessage } from './xuxu-chat.js';
import { chatWithXuxu } from '../features/xuxu/xuxu.service.js';
import { ensureWechatSession, isSignedIn } from '../features/auth/auth-store.js';

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
  if (!isSignedIn()) await ensureWechatSession();
  if (!isSignedIn()) {
    messages.value.push({
      id: `assistant-error-${Date.now()}`,
      role: 'assistant',
      text: '登录后我才能同步你的健康记录并使用序序云端对话。请先完成登录，再回来继续聊天。',
      sourceTitle: '需要登录',
    });
    connectionState.value = 'retry';
    return;
  }
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
    const kind = classifyXuxuError(error);
    const requestId = error instanceof Error ? error.message.match(/\[([^\]]+)\]/u)?.[1] : undefined;
    const fallback = createOfflineReply(text);
    const prefix = kind === 'network'
      ? '暂时没连上网络。'
      : kind === 'service'
        ? '序序云端服务正在忙。'
        : '这次没有拿到序序云端回复。';
    messages.value.push({
      ...fallback,
      id: `assistant-error-${Date.now()}`,
      text: `${prefix}下面先给你一条本地陪伴建议（不是大模型回复）：${fallback.text}`,
      sourceTitle: requestId ? `本地陪伴建议 · 请求号 ${requestId}` : '本地陪伴建议 · 可重试',
    });
    connectionState.value = 'retry';
  } finally {
    typing.value = false;
  }
}

const connectionStatusLabel = computed(() => connectionState.value === 'thinking' ? '正在回复' : connectionState.value === 'retry' ? '连接稍有波动' : '随时可聊');
function voiceNotice() { uni.showToast({ title: '语音输入正在准备中，先试试打字吧', icon: 'none' }); }
function openLogin() { uni.navigateTo({ url: '/pages/auth/AppAuthPage' }); }
function retryLast() { const last = [...messages.value].reverse().find((message) => message.role === 'user'); if (last) send(last.text); }
</script>

<style scoped>
/* ============================================================
 * 序序聊天 · 晨雾玻璃 v3
 * 去贴图感：插画 mix-blend 溶入画布；气泡用不对称圆角 + 玻璃材质；
 * 全页共享全局氛围画布（根容器透明）。
 * ============================================================ */
.chat-shell {
  display: flex;
  flex: 1 1 auto;
  width: 100%;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  box-sizing: border-box;
  padding: 0;
  background: transparent;
  color: var(--hz-ink);
}

/* ---------- 头部 ---------- */
.chat-head {
  display: flex;
  align-items: center;
  gap: 18rpx;
  min-height: 96rpx;
  margin: 0 28rpx;
  padding: calc(env(safe-area-inset-top) + 16rpx) 4rpx 18rpx;
  border-bottom: 1rpx solid var(--hz-rule-glass);
}
.avatar-frame {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88rpx;
  height: 88rpx;
  flex: none;
  padding: 4rpx;
  border: 1rpx solid rgba(159, 195, 173, 0.6);
  border-radius: 50%;
  background: linear-gradient(160deg, #ffffff 0%, #eef5ef 100%);
  box-shadow: 0 10rpx 22rpx rgba(47, 107, 77, 0.14), inset 0 1rpx 0 rgba(255, 255, 255, 0.95);
  overflow: hidden;
}
.chat-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}
.chat-head-copy {
  flex: 1;
  min-width: 0;
}
.chat-title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.chat-name {
  color: var(--hz-ink);
  font-size: 34rpx;
  font-weight: 800;
}
.chat-status {
  display: block;
  margin-top: 6rpx;
  color: var(--hz-muted);
  font-size: 20rpx;
}
.head-mark { display: none; }
.status-chip {
  display: flex;
  align-items: center;
  gap: 7rpx;
  padding: 7rpx 14rpx;
  border: 1rpx solid rgba(159, 195, 173, 0.5);
  border-radius: 999rpx;
  color: var(--hz-green);
  background: var(--hz-green-soft);
  font-size: 17rpx;
  font-weight: 700;
}
.status-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: var(--hz-green-bright);
  box-shadow: 0 0 0 4rpx rgba(72, 163, 119, 0.16);
}
.status-thinking { color: #9a6b2f; border-color: rgba(199, 138, 59, 0.4); background: var(--hz-amber-soft); }
.status-thinking .status-dot { background: #d2a15b; box-shadow: 0 0 0 4rpx rgba(210, 161, 91, 0.16); }
.status-retry { color: #a96c73; border-color: rgba(199, 121, 134, 0.4); background: var(--hz-blush-soft); }
.status-retry .status-dot { background: #d48b73; box-shadow: 0 0 0 4rpx rgba(212, 139, 115, 0.16); }

/* ---------- 健康画像：轻量玻璃条 ---------- */
.chat-profile {
  margin: 16rpx 28rpx 0;
  padding: 18rpx 20rpx 17rpx;
  border: 1rpx solid var(--hz-rule-glass);
  border-radius: var(--hz-radius-control);
  background: var(--hz-surface-glass);
  box-shadow: var(--hz-highlight), var(--hz-shadow-card);
  -webkit-backdrop-filter: var(--hz-blur);
  backdrop-filter: var(--hz-blur);
}
.profile-head { display: flex; align-items: center; justify-content: space-between; }
.profile-title { display: block; color: var(--hz-ink-soft); font-size: 23rpx; font-weight: 700; }
.profile-subtitle { display: block; margin-top: 4rpx; color: var(--hz-faint); font-size: 18rpx; }
.profile-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 72rpx;
  height: 42rpx;
  padding: 0 12rpx;
  border: 1rpx solid rgba(159, 195, 173, 0.45);
  border-radius: 999rpx;
  color: var(--hz-green);
  background: var(--hz-green-soft);
  font-size: 18rpx;
  line-height: 1;
}
.profile-toggle::after { border: 0; }
.profile-tags { display: flex; flex-wrap: wrap; gap: 10rpx; margin-top: 14rpx; }
.profile-tag {
  padding: 7rpx 14rpx;
  border: 1rpx solid rgba(159, 195, 173, 0.4);
  border-radius: 999rpx;
  color: var(--hz-green);
  background: rgba(255, 255, 255, 0.72);
  font-size: 19rpx;
}

/* ---------- 消息区 ---------- */
.messages {
  flex: 1;
  width: 100%;
  height: 0;
  min-height: 0;
  box-sizing: border-box;
  padding: 24rpx 28rpx 18rpx;
}
.empty-chat {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 30rpx 12rpx 30rpx;
  text-align: center;
}
/* 吉祥物徽章：圆形裁切 + 玻璃描边圈 + 外圈柔光，像 App 的头像章而不是贴图 */
.empty-medallion {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 248rpx;
  height: 248rpx;
  border-radius: 50%;
  background: radial-gradient(
    closest-side,
    rgba(125, 178, 148, 0.18),
    rgba(255, 255, 255, 0.5) 72%,
    transparent
  );
}
.empty-medallion::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: linear-gradient(160deg, #ffffff 0%, #f2f7ef 100%);
  box-shadow:
    inset 0 1rpx 0 rgba(255, 255, 255, 0.95),
    0 16rpx 36rpx rgba(47, 107, 77, 0.14),
    0 0 0 1rpx rgba(159, 195, 173, 0.45);
}
.empty-illustration {
  position: relative;
  display: block;
  width: 218rpx;
  height: 218rpx;
  border-radius: 50%;
  overflow: hidden;
  transform: scale(1.06);
}
.empty-kicker { margin-top: 0; color: var(--hz-green); font-size: 20rpx; font-weight: 700; }
.empty-title { margin-top: 10rpx; color: var(--hz-ink); font-size: 30rpx; font-weight: 800; line-height: 1.35; }
.empty-copy { max-width: 520rpx; margin-top: 10rpx; color: var(--hz-muted); font-size: 21rpx; line-height: 1.65; }

/* ---------- 气泡 ---------- */
.message { display: flex; align-items: flex-start; gap: 14rpx; margin: 20rpx 0; }
.message.assistant { padding-right: 40rpx; }
.message.user { justify-content: flex-end; padding-left: 40rpx; }
.message-avatar {
  width: 56rpx;
  height: 56rpx;
  flex: none;
  margin-top: 4rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  background: linear-gradient(160deg, #ffffff 0%, #eef5ef 100%);
  box-shadow: 0 6rpx 14rpx rgba(47, 107, 77, 0.12);
}
.message-body { max-width: calc(100% - 70rpx); min-width: 0; }
.message-label { display: none; }
/* 序序：白色玻璃气泡，左上角收口 */
.message-text {
  display: block;
  max-width: 100%;
  word-break: break-word;
  padding: 18rpx 22rpx;
  border: 1rpx solid var(--hz-rule-glass);
  border-radius: 6rpx 26rpx 26rpx 26rpx;
  color: var(--hz-ink);
  background: var(--hz-surface-glass);
  box-shadow: var(--hz-highlight), 0 8rpx 22rpx rgba(29, 55, 41, 0.07);
  -webkit-backdrop-filter: var(--hz-blur);
  backdrop-filter: var(--hz-blur);
  font-size: 24rpx;
  line-height: 1.7;
}
/* 用户：晨绿渐变气泡，右上角收口 */
.message.user .message-text {
  border: 1rpx solid rgba(125, 178, 148, 0.55);
  border-radius: 26rpx 6rpx 26rpx 26rpx;
  color: #234c39;
  background: linear-gradient(135deg, rgba(199, 228, 211, 0.95) 0%, rgba(170, 210, 187, 0.9) 100%);
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.75), 0 8rpx 20rpx rgba(47, 107, 77, 0.12);
}
.source-card {
  display: flex;
  align-items: center;
  gap: 7rpx;
  margin-top: 10rpx;
  padding: 9rpx 13rpx;
  border: 1rpx solid var(--hz-rule-glass);
  border-radius: 12rpx;
  color: var(--hz-muted);
  background: rgba(255, 255, 255, 0.7);
  font-size: 18rpx;
}
.source-card image { width: 24rpx; height: 24rpx; opacity: 0.7; }
.retry-message {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 9rpx 0 0 5rpx;
  padding: 6rpx 14rpx;
  border: 1rpx solid rgba(199, 121, 134, 0.45);
  border-radius: 999rpx;
  color: #a96c73;
  background: var(--hz-blush-soft);
  font-size: 18rpx;
  line-height: 30rpx;
}
.login-message { border-color: #c4d9ca; color: #3d7650; background: #f0f7f1; }
.typing {
  display: flex;
  align-items: center;
  gap: 6rpx;
  height: 56rpx;
  padding: 0 20rpx;
  border: 1rpx solid var(--hz-rule-glass);
  border-radius: 6rpx 26rpx 26rpx 26rpx;
  background: var(--hz-surface-glass);
}
.typing text { width: 9rpx; height: 9rpx; border-radius: 50%; background: var(--hz-green-bright); animation: breathe 1.1s ease-in-out infinite; }
.typing text:nth-child(2) { animation-delay: 0.14s; }
.typing text:nth-child(3) { animation-delay: 0.28s; }
@keyframes breathe { 0%, 100% { opacity: 0.35; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-3rpx); } }

/* ---------- 快捷问题 ---------- */
.quick {
  display: flex;
  flex: none;
  width: 100%;
  box-sizing: border-box;
  padding: 14rpx 28rpx 10rpx;
  border-top: 1rpx solid var(--hz-rule-glass);
  background: rgba(255, 253, 249, 0.72);
  -webkit-backdrop-filter: var(--hz-blur);
  backdrop-filter: var(--hz-blur);
  white-space: nowrap;
}
.quick-label {
  display: inline-flex;
  align-items: center;
  height: 54rpx;
  margin-right: 10rpx;
  color: var(--hz-faint);
  font-size: 19rpx;
  white-space: nowrap;
}
.quick button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 54rpx;
  margin-right: 10rpx;
  padding: 0 18rpx;
  border: 1rpx solid rgba(159, 195, 173, 0.5);
  border-radius: 999rpx;
  color: var(--hz-green);
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 4rpx 12rpx rgba(47, 107, 77, 0.06);
  font-size: 20rpx;
  line-height: 1;
}

/* ---------- 输入区 ---------- */
.composer { display: flex; align-items: center; gap: 12rpx; flex: none; padding: 10rpx 28rpx 0; }
.icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  flex: none;
  border: 1rpx solid var(--hz-rule-glass);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 4rpx 12rpx rgba(29, 55, 41, 0.05);
}
.icon-button::after { border: 0; }
.icon-button image { width: 32rpx; height: 32rpx; opacity: 0.62; }
.composer input {
  flex: 1;
  min-width: 0;
  height: 76rpx;
  padding: 0 24rpx;
  border: 1rpx solid var(--hz-rule-glass);
  border-radius: 999rpx;
  color: var(--hz-ink);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.96), 0 6rpx 16rpx rgba(29, 55, 41, 0.05);
  font-size: 24rpx;
}
.composer input::placeholder { color: var(--hz-faint); }
.send {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 72rpx;
  flex: none;
  border: 1rpx solid var(--hz-rule-glass);
  border-radius: 50%;
  background: #eef4ef;
  border-color: #d5e2d8;
}
.send::after { border: 0; }
.send.enabled {
  border-color: rgba(125, 178, 148, 0.6);
  background: linear-gradient(135deg, #6cae8c 0%, #4c9573 100%);
  box-shadow: 0 10rpx 22rpx rgba(47, 107, 77, 0.3), inset 0 1rpx 0 rgba(255, 255, 255, 0.4);
}
.send image { width: 32rpx; height: 32rpx; opacity: 0.62; }
.send[disabled] { background: #e7efe9; border-color: #cbdacf; }
.send[disabled] image { opacity: 0.82; }
.send.enabled image { opacity: 0.95; }
.disclaimer { display: block; padding: 10rpx 28rpx 4rpx; color: var(--hz-faint); text-align: center; font-size: 17rpx; }
</style>
