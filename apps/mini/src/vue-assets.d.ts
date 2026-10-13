import '@vue/runtime-core';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $asset: (path: string) => string;
  }
}
