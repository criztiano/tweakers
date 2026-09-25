import { afterEach, expect, it, vi } from 'vitest';
import { MovePadListStoreClass } from '../src/move-pad-list';
import { MoveFunctions } from '../src/move-functions';

const releases: (() => void)[] = [];
afterEach(() => { for (const release of releases.splice(0).reverse()) release(); });
function setup(onSubmit = vi.fn()) {
  const store = new MovePadListStoreClass();
  releases.push(store.attach('page', 'extract', { label: 'Parts', submitLabel: 'Extract', options: [{ value: 'drums', label: 'Drums' }, { value: 'bass', label: 'Bass' }], onSubmit }));
  store.open('page', 'extract');
  return store;
}
it('preserves checked options and cursor, borrowing Enter and restoring the latest app handler', () => {
  const oldApp = vi.fn(), newApp = vi.fn();
  releases.push(MoveFunctions.attach('capture', oldApp));
  const store = setup();
  MoveFunctions.run('sample');
  MoveFunctions.run('down');
  MoveFunctions.run('jog_click');
  releases.push(MoveFunctions.attach('capture', newApp));
  expect(MoveFunctions.label('capture')).toBe('Extract');
  store.close(); store.open('page', 'extract');
  expect(store.getView()?.selected).toEqual(['drums', 'bass']);
  expect(store.getView()?.cursor).toBe(1);
  store.close(); MoveFunctions.run('capture');
  expect(newApp).toHaveBeenCalledOnce(); expect(oldApp).not.toHaveBeenCalled();
});
it('guards empty and repeated Capture, including close/reopen while submission is pending', async () => {
  let finish!: () => void;
  const onSubmit = vi.fn(() => new Promise<void>(resolve => { finish = resolve; }));
  const store = setup(onSubmit);
  await store.submit(); expect(onSubmit).not.toHaveBeenCalled();
  expect(store.getView()?.error).toMatch(/Select at least one/);
  store.toggleCursor(); const pending = store.submit();
  store.close(); store.open('page', 'extract');
  expect(store.getView()?.pending).toBe(true);
  await store.submit(); expect(onSubmit).toHaveBeenCalledOnce();
  finish(); await pending; expect(store.getView()).toBeNull();
});
it('keeps failed submissions retryable', async () => {
  const onSubmit = vi.fn().mockRejectedValueOnce(new Error('Try again')).mockResolvedValue(undefined);
  const store = setup(onSubmit); store.toggleCursor();
  await store.submit(); expect(store.getView()?.error).toBe('Try again');
  await store.submit(); expect(store.getView()).toBeNull(); expect(onSubmit).toHaveBeenCalledTimes(2);
});
it('releases nested overrides independently without reviving stale base attachments', () => {
  const base = vi.fn(), outer = vi.fn(), inner = vi.fn();
  const detach = MoveFunctions.attach('capture', base);
  const popOuter = MoveFunctions.push('capture', outer);
  const popInner = MoveFunctions.push('capture', inner);
  detach(); popOuter(); MoveFunctions.run('capture'); expect(inner).toHaveBeenCalledOnce();
  popInner(); MoveFunctions.run('capture'); expect(base).not.toHaveBeenCalled(); expect(outer).not.toHaveBeenCalled();
});
it('shares in-flight submission across replacement attachments and releases it on completion', async () => {
  let finish!: () => void;
  const onSubmit = vi.fn(() => new Promise<void>(resolve => { finish = resolve; }));
  const store = setup(onSubmit); store.toggleCursor();
  const pending = store.submit();
  const nextSubmit = vi.fn();
  releases.push(store.attach('page', 'extract', { options: [{ value: 'drums', label: 'Drums' }], onSubmit: nextSubmit }));
  store.open('page', 'extract');
  await store.submit(); expect(nextSubmit).not.toHaveBeenCalled();
  finish(); await pending; expect(store.getView()).toBeNull();
  store.open('page', 'extract'); await store.submit();
  expect(nextSubmit).toHaveBeenCalledOnce();
});
it('uses the same pad to open and submit, keeping Back as dismissal and Capture out of the chips', async () => {
  const submit = vi.fn();
  const store = setup(submit);
  store.close();
  store.activate('page', 'extract');
  expect(store.getView()?.submitLabel).toBe('Extract');
  expect(MoveFunctions.chips().some(chip => chip.name === 'capture')).toBe(false);
  MoveFunctions.run('sample');
  MoveFunctions.run('back');
  expect(store.getView()).toBeNull();
  expect(submit).not.toHaveBeenCalled();
  store.activate('page', 'extract');
  await store.activate('page', 'extract');
  expect(submit).toHaveBeenCalledExactlyOnceWith(['drums']);
  expect(store.getView()).toBeNull();
});
it('does not submit twice through repeated pad presses while pending', async () => {
  let finish!: () => void;
  const submit = vi.fn(() => new Promise<void>(resolve => { finish = resolve; }));
  const store = setup(submit);
  store.toggleCursor();
  const pending = store.activate('page', 'extract');
  await store.activate('page', 'extract');
  expect(submit).toHaveBeenCalledOnce();
  expect(store.getView()?.pending).toBe(true);
  finish(); await pending;
  expect(store.getView()).toBeNull();
});

function picker(onSubmit = vi.fn(), selected = ['plasma']) {
  const store = new MovePadListStoreClass();
  releases.push(store.attach('page', 'shader', {
    label: 'Shader', single: true, selected,
    options: [{ value: 'gradient', label: 'Gradient' }, { value: 'plasma', label: 'Plasma' }, { value: 'waves', label: 'Waves' }],
    onSubmit,
  }));
  return store;
}
it('opens a single list on its current choice, and the closed pad names it', () => {
  const store = picker();
  expect(store.choice('page', 'shader')?.label).toBe('Plasma');
  store.open('page', 'shader');
  expect(store.getView()?.cursor).toBe(1);
  expect(store.getView()?.single).toBe(true);
});
it('replaces and commits a single choice at once — Sample, the jog click, Capture or the pad', async () => {
  for (const take of [
    (s: MovePadListStoreClass) => MoveFunctions.run('sample'),
    (s: MovePadListStoreClass) => MoveFunctions.run('jog_click'),
    (s: MovePadListStoreClass) => MoveFunctions.run('capture'),
    (s: MovePadListStoreClass) => s.activate('page', 'shader'),
  ]) {
    const onSubmit = vi.fn();
    const store = picker(onSubmit);
    store.open('page', 'shader');
    MoveFunctions.run('down');
    await take(store);
    // the new choice alone — never plasma AND waves
    expect(onSubmit).toHaveBeenCalledWith(['waves']);
    expect(store.getView()).toBeNull();
    expect(store.choice('page', 'shader')?.label).toBe('Waves');
    for (const release of releases.splice(0).reverse()) release();
  }
});
it('takes the host\'s choice on re-attach, where a checked list keeps what was ticked', () => {
  const store = picker(vi.fn(), ['plasma']);
  releases.push(store.attach('page', 'shader', {
    label: 'Shader', single: true, selected: ['gradient'],
    options: [{ value: 'gradient', label: 'Gradient' }, { value: 'plasma', label: 'Plasma' }],
    onSubmit: vi.fn(),
  }));
  expect(store.choice('page', 'shader')?.label).toBe('Gradient');
  // a checked list has no single choice to name
  const checked = setup();
  expect(checked.choice('page', 'extract')).toBeNull();
});

it('keeps its own name when the value reads elsewhere', () => {
  const store = picker(vi.fn(), ['story']);
  releases.push(store.attach('page', 'preset', {
    label: 'Presets', single: true, keepLabel: true, selected: ['story'],
    options: [{ value: 'story', label: 'Story' }, { value: 'square', label: 'Square' }],
    onSubmit: vi.fn(),
  }));
  // the pad says what a press does; the choice still stands
  expect(store.choice('page', 'preset')).toBeNull();
  expect(store.selected('page', 'preset')).toEqual(['story']);
  for (const release of releases.splice(0).reverse()) release();
});
