<template>
  <view class="wechat-auth-page">
    <image
      class="auth-backdrop"
      src="/static/illustrations/onboarding-guide-vertical.png"
      mode="aspectFill"
    />
    <view class="auth-wash" />

    <view class="auth-content">
      <view class="brand-lockup">
        <image class="brand-avatar" src="/static/illustrations/xuxu-avatar.png" mode="aspectFill" />
        <view>
          <text class="brand-name">和生序</text>
          <text class="brand-caption">让每一份健康记录，都只属于你</text>
        </view>
      </view>

      <view class="auth-panel">
        <text class="eyebrow">微信小程序</text>
        <text class="title">先连接微信账号</text>
        <text class="subtitle">登录后再建立健康档案，饮食、体重和序序对话会保存到你的专属账号。</text>

        <view class="privacy-row">
          <view class="privacy-icon">✓</view>
          <text>仅使用微信身份识别账号，不读取手机号，不会进入 App 的邮箱登录流程。</text>
        </view>

        <text v-if="errorMessage" class="error-message">{{ errorMessage }}</text>
        <button class="wechat-button" :disabled="submitting" @tap="authorize">
          <view class="wechat-mark">微</view>
          <text>{{ submitting ? '正在连接…' : errorMessage ? '重新连接' : '微信授权登录' }}</text>
        </button>
        <text class="agreement">继续即表示你同意使用微信身份创建和生序账号；健康数据按账号隔离保存。</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { isAppRuntime, isSignedIn, loginWithWechat } from '../../features/auth/auth-store.js';

const submitting = ref(false);
const errorMessage = ref('');

onLoad(() => {
  if (isAppRuntime()) {
    uni.reLaunch({ url: '/pages/auth/AppAuthPage' });
    return;
  }
  if (isSignedIn()) uni.reLaunch({ url: '/pages/bootstrap/BootstrapPage' });
});

async function authorize() {
  if (submitting.value) return;
  submitting.value = true;
  errorMessage.value = '';
  try {
    await loginWithWechat();
    uni.reLaunch({ url: '/pages/bootstrap/BootstrapPage' });
  } catch (error) {
    errorMessage.value = readableWechatError(error);
  } finally {
    submitting.value = false;
  }
}

function readableWechatError(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  if (/配置|APP_SECRET|40013|40125/u.test(message)) return '微信登录配置暂时不可用，请稍后再试。';
  if (/40029|40163|凭证|code/iu.test(message)) return '本次授权已过期，请重新连接微信。';
  if (/timeout|network|request:fail/iu.test(message)) return '网络连接不稳定，请检查网络后重新连接。';
  return '暂时没有连接成功，请稍后重新连接。';
}
</script>

<style scoped>
.wechat-auth-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: #fffdf7;
  color: #244331;
}
.auth-backdrop { position: absolute; inset: 0; width: 100%; height: 100%; }
.auth-wash {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255,253,247,0.18) 0%, rgba(255,253,247,0.54) 46%, #fffdf7 100%);
}
.auth-content {
  position: relative;
  z-index: 1;
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  justify-content: space-between;
  padding: calc(env(safe-area-inset-top) + 54rpx) 36rpx calc(env(safe-area-inset-bottom) + 42rpx);
}
.brand-lockup { display: flex; align-items: center; gap: 18rpx; }
.brand-avatar { width: 86rpx; height: 86rpx; border: 4rpx solid rgba(255,255,255,0.9); border-radius: 50%; box-shadow: 0 12rpx 30rpx rgba(57,112,75,0.14); }
.brand-name { display: block; color: #315f43; font-size: 32rpx; font-weight: 800; }
.brand-caption { display: block; margin-top: 4rpx; color: #64806d; font-size: 21rpx; }
.auth-panel {
  padding: 38rpx 34rpx 32rpx;
  border: 1rpx solid rgba(78,128,92,0.16);
  border-radius: 30rpx;
  background: rgba(255,255,255,0.96);
  box-shadow: 0 24rpx 64rpx rgba(62,91,68,0.13);
}
.eyebrow { display: block; color: #6ca17c; font-size: 22rpx; font-weight: 700; letter-spacing: 3rpx; }
.title { display: block; margin-top: 14rpx; color: #244331; font-size: 48rpx; font-weight: 800; line-height: 1.25; }
.subtitle { display: block; margin-top: 18rpx; color: #66776c; font-size: 27rpx; line-height: 1.75; }
.privacy-row { display: flex; align-items: flex-start; gap: 14rpx; margin: 28rpx 0; padding: 20rpx; border-radius: 18rpx; background: #f3f8f2; color: #587061; font-size: 23rpx; line-height: 1.65; }
.privacy-icon { display: flex; align-items: center; justify-content: center; flex: 0 0 auto; width: 34rpx; height: 34rpx; margin-top: 2rpx; border-radius: 50%; background: #70a982; color: #fff; font-size: 21rpx; font-weight: 800; }
.error-message { display: block; margin: -4rpx 0 18rpx; color: #a85642; font-size: 23rpx; line-height: 1.55; }
.wechat-button { display: flex; align-items: center; justify-content: center; gap: 14rpx; width: 100%; height: 92rpx; border-radius: 20rpx; background: #397a50; color: #fff; font-size: 29rpx; font-weight: 800; line-height: 1; box-shadow: 0 14rpx 30rpx rgba(57,122,80,0.24); }
.wechat-button[disabled] { background: #79a989; box-shadow: none; }
.wechat-mark { display: flex; align-items: center; justify-content: center; width: 38rpx; height: 38rpx; border: 2rpx solid rgba(255,255,255,0.8); border-radius: 50%; font-size: 19rpx; }
.agreement { display: block; margin-top: 20rpx; color: #9a9f98; font-size: 20rpx; line-height: 1.55; text-align: center; }
</style>
