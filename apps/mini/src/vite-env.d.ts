declare module '*?raw' {
  const source: string;
  export default source;
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $asset: (path: string) => string;
  }
}
