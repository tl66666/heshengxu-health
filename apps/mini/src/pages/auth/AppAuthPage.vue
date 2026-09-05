<template>
  <view class="auth-page">
    <view class="auth-art" aria-hidden="true">
      <image src="/static/illustrations/xuxu-safe-support.png" mode="aspectFit" />
    </view>
    <view class="auth-copy">
      <text class="eyebrow">和生序 · App</text>
      <text class="title">先照顾好自己</text>
      <text class="subtitle">注册一个账号，记录会跟着你走。</text>
    </view>
    <view class="auth-panel">
      <view class="mode-switch">
        <button :class="['mode-button', { active: mode === 'register' }]" @tap="mode = 'register'">注册账号</button>
        <button :class="['mode-button', { active: mode === 'login' }]" @tap="mode = 'login'">登录</button>
      </view>
      <view class="field">
        <text class="field-label">邮箱</text>
        <input v-model="email" class="field-input" type="text" inputmode="email" placeholder="输入常用邮箱" maxlength="128" />
      </view>
      <view class="field">
        <text class="field-label">密码</text>
        <input v-model="password" class="field-input" type="password" placeholder="至少 8 位字符" maxlength="128" />
      </view>
      <view v-if="mode === 'register'" class="field">
        <text class="field-label">确认密码</text>
        <input v-model="passwordAgain" class="field-input" type="password" placeholder="再输入一次密码" maxlength="128" />
      </view>
      <text v-if="errorMessage" class="error-message">{{ errorMessage }}</text>
      <button class="submit-button" :disabled="submitting" @tap="submit">
        {{ submitting ? '正在处理…' : mode === 'register' ? '注册并继续' : '登录和生序' }}
      </button>
      <text class="privacy-note">账号密码仅用于和生序登录，不会写入小程序或 App 安装包。</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { loginWithPassword, registerWithPassword } from '../../features/auth/auth-store.js';

const mode = ref<'register' | 'login'>('register');
const email = ref('');
const password = ref('');
const passwordAgain = ref('');
const errorMessage = ref('');
const submitting = ref(false);

async function submit() {
  errorMessage.value = '';
  const normalizedEmail = email.value.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) return void (errorMessage.value = '请填写正确的邮箱');
  if (password.value.length < 8) return void (errorMessage.value = '密码至少需要 8 位');
  if (mode.value === 'register' && password.value !== passwordAgain.value) return void (errorMessage.value = '两次输入的密码不一致');
  submitting.value = true;
  try {
    if (mode.value === 'register') {
      await registerWithPassword(normalizedEmail, password.value);
      mode.value = 'login';
      passwordAgain.value = '';
      uni.showToast({ title: '注册成功，请登录', icon: 'none' });
    } else {
      await loginWithPassword(normalizedEmail, password.value);
      uni.reLaunch({ url: '/pages/bootstrap/BootstrapPage' });
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '暂时无法完成，请稍后再试';
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.auth-page { min-height: 100vh; padding: calc(env(safe-area-inset-top) + 72rpx) 42rpx calc(env(safe-area-inset-bottom) + 42rpx); background: #fffdf9; color: #273a30; }
.auth-art { height: 220rpx; margin: 0 auto 18rpx; text-align: center; }
.auth-art image { width: 100%; height: 100%; }
.auth-copy { margin-bottom: 34rpx; }
.eyebrow { display: block; margin-bottom: 14rpx; color: #8e7864; font-size: 23rpx; letter-spacing: 2rpx; }
.title { display: block; color: #273a30; font-size: 48rpx; font-weight: 700; }
.subtitle { display: block; margin-top: 12rpx; color: #788278; font-size: 26rpx; }
.auth-panel { padding: 30rpx; border: 1rpx solid rgba(219, 204, 185, 0.7); border-radius: 28rpx; background: rgba(255, 255, 255, 0.86); box-shadow: 0 18rpx 50rpx rgba(104, 81, 57, 0.08); }
.mode-switch { display: flex; gap: 8rpx; margin-bottom: 28rpx; padding: 6rpx; border-radius: 18rpx; background: #f4eee6; }
.mode-button { display: flex; align-items: center; justify-content: center; flex: 1; height: 72rpx; padding: 0; border-radius: 14rpx; color: #8b8277; font-size: 25rpx; line-height: 1; }
.mode-button.active { background: #fff; color: #3f6950; font-weight: 700; box-shadow: 0 4rpx 14rpx rgba(84, 75, 62, 0.08); }
.field { margin-bottom: 20rpx; }
.field-label { display: block; margin-bottom: 10rpx; color: #59665d; font-size: 23rpx; font-weight: 600; }
.field-input { width: 100%; height: 84rpx; padding: 0 22rpx; border: 1rpx solid #e6ded3; border-radius: 16rpx; background: #fffdfa; color: #273a30; font-size: 28rpx; }
.error-message { display: block; margin: 2rpx 0 18rpx; color: #ad654e; font-size: 23rpx; }
.submit-button { display: flex; align-items: center; justify-content: center; width: 100%; height: 86rpx; padding: 0 24rpx; border-radius: 18rpx; background: #3f6950; color: #fffdf9; font-size: 28rpx; font-weight: 700; line-height: 1; }
.submit-button[disabled] { opacity: 0.55; }
.privacy-note { display: block; margin-top: 20rpx; color: #a09a91; font-size: 20rpx; line-height: 1.5; text-align: center; }
</style>
