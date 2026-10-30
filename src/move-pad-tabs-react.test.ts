import { createElement } from 'react';
import { create } from 'react-test-renderer';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MovePadTabsBody } from './components/move-slots';

const OPTIONS = [
  { value: 'reveal', label: 'Reveal', icon: 'wand-sparkles' },
  { value: 'emitter', label: 'Emitter', icon: 'expand' },
];

const render = (labels?: boolean) => create(createElement(MovePadTabsBody, { options: OPTIONS, activeIdx: 0, labels })).root;
const titles = (root: ReturnType<typeof render>) =>
  root.findAll((n) => n.props.className === 'tweakers-move-tab-title').map((n) => n.props.children);
const glyphs = (root: ReturnType<typeof render>) =>
  root.findAll((n) => n.type === 'svg' && n.props.className === 'tweakers-move-tab-icon').length;

describe('MovePadTabsBody', () => {
  it('draws a glyphed option as its glyph alone by default', () => {
    const root = render();
    assert.equal(glyphs(root), 2);
    assert.deepEqual(titles(root), []);
  });

  it('keeps each glyphed option\'s name beside it with labels', () => {
    const root = render(true);
    assert.equal(glyphs(root), 2);
    assert.deepEqual(titles(root), ['Reveal', 'Emitter']);
  });
});
