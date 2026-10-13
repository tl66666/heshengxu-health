import 'vue';

declare module 'vue' {
  interface ComponentCustomProperties {
    $asset: (path: string) => string;
  }
}
