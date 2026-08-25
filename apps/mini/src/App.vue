<template>
  <slot />
</template>

<style lang="scss">
@import './styles/tokens.scss';

page {
  background: $color-canvas;
  color: $color-ink;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
}
button::after {
  border: 0;
}
</style>
