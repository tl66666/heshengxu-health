<script lang="ts">
export default {};
</script>

<style>
@import './styles/mini-tokens.css';

page {
  background: #fff7f1;
  color: #51484b;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', sans-serif;
  font-size: 28rpx;
  -webkit-font-smoothing: antialiased;
}
view,
text,
button,
input,
image,
scroll-view {
  box-sizing: border-box;
}
image {
  display: block;
}
button {
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 0;
  color: inherit;
  background: transparent;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', sans-serif;
  line-height: normal;
  transition:
    transform 0.16s ease,
    opacity 0.16s ease;
}
button[disabled] {
  opacity: 1;
}
input {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', sans-serif;
}
button::after {
  border: 0;
}
/* 统一按压反馈：所有 button 默认 hover-class 即 button-hover */
.button-hover {
  transform: scale(0.97);
  opacity: 0.88;
}
/* 入场动效：区块上浮淡入，配 hz-rise-1..4 做阶梯延迟 */
@keyframes hz-rise {
  from {
    opacity: 0;
    transform: translateY(18rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.hz-rise {
  animation: hz-rise 0.45s cubic-bezier(0.22, 0.8, 0.36, 1) both;
}
.hz-rise-1 {
  animation-delay: 0.06s;
}
.hz-rise-2 {
  animation-delay: 0.12s;
}
.hz-rise-3 {
  animation-delay: 0.18s;
}
.hz-rise-4 {
  animation-delay: 0.24s;
}
/* 轻浮动：只用于无文字承载的插画元素 */
@keyframes hz-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10rpx);
  }
}
.hz-float {
  animation: hz-float 3.4s ease-in-out infinite;
}
</style>
