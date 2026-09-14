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
