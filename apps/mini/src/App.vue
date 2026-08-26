<template>
  <slot />
</template>

<style>
@import './styles/mini-tokens.css';

page {
  background: #f7fbf8;
  color: #183425;
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
</style>
