import { test, expect } from 'vitest';
import { TweakStore } from '../src/store/TweakStore';
import { buildMovePages, movePadRows, visibleColumns } from '../src/move-layout';

test('two momentary actions can sit under one dial using the top row', () => {
  TweakStore.registerPanel('tempo-action-test', 'Tempo', { tempo: [120, 20, 400], double: { type: 'action' }, half: { type: 'action' } }, undefined, { movePads: { double: 0, half: 0 }, moveTopRow: ['double'] });
  try {
    const [page] = buildMovePages([TweakStore.getPanel('tempo-action-test')!]);
    expect(page.dials).toHaveLength(1);
    expect(page.topValues?.[0]?.path).toBe('double');
    expect(page.actions[0].path).toBe('half');
    expect(movePadRows(page, 0).flat().filter(Boolean).map(meta => meta.type)).toEqual(['action', 'action']);
    expect(visibleColumns(page)).toEqual([0]);
  } finally { TweakStore.unregisterPanel('tempo-action-test'); }
});
