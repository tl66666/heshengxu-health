import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import { parse, compileTemplate } from 'vue/compiler-sfc';
import ts from 'typescript';
import { createSSRApp, ref } from 'vue';
import { renderToString } from 'vue/server-renderer';
import source from './RecordsPage.vue?raw';

const require = createRequire(import.meta.url);
const descriptor = parse(source).descriptor;
const compiled = compileTemplate({
  source: descriptor.template!.content,
  filename: 'RecordsPage.vue',
  id: 'records-state',
  ssr: true,
  ssrCssVars: [],
  compilerOptions: { isCustomElement: () => true },
});
const js = ts.transpileModule(compiled.code, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const module = { exports: {} as { ssrRender?: unknown } };
new Function('require', 'module', 'exports', js)(require, module, module.exports);
async function render(loading: boolean) {
  const busy = ref(loading);
  const app = createSSRApp({
    ssrRender: module.exports.ssrRender,
    setup: () => ({
      loading: busy,
      store: { loading: busy },
      timeline: ref([]),
      loadError: ref(''),
      saveError: ref(''),
      saving: ref(false),
      formTitle: '记下真实记录',
      formCaption: '按实际情况填写',
      note: ref(''),
      activeType: ref('weight'),
      editingId: ref(null),
      foodEntries: ref([]),
      fieldError: () => '',
      weight: ref(''),
      date: '2026-10-13',
      types: [],
    }),
  } as Parameters<typeof createSSRApp>[0]);
  return renderToString(app);
}
describe('records loading presentation', () => {
  it('shows the record form once loading has finished', async () => {
    const html = await render(false);
    expect(html).not.toContain('正在整理今天的记录');
    expect(html).toContain('保存记录');
  });
  it('shows only the loading state while a load is pending', async () => {
    const html = await render(true);
    expect(html).toContain('正在整理今天的记录');
    expect(html).not.toContain('保存记录');
  });
});
