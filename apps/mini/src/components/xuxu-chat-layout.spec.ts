import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const componentPath = resolve(dirname(fileURLToPath(import.meta.url)), 'XuxuChatComposer.vue');
const componentSource = readFileSync(componentPath, 'utf8');

describe('Xuxu chat layout contracts', () => {
  it('gives the chat shell a definite height so scroll-view can measure its viewport', () => {
    expect(componentSource).toMatch(/\.chat-shell\s*\{[^}]*height:\s*100%/s);
  });

  it('preserves line breaks and wraps long assistant replies inside the bubble', () => {
    expect(componentSource).toMatch(/\.message-text\s*\{[^}]*white-space:\s*pre-wrap/s);
    expect(componentSource).toMatch(/\.message-text\s*\{[^}]*overflow-wrap:\s*anywhere/s);
  });

  it('scrolls to a bottom anchor after a reply instead of aligning the bubble itself', () => {
    expect(componentSource).toContain(':scroll-into-view="scrollTarget"');
    expect(componentSource).toContain('id="chat-bottom"');
  });
});
