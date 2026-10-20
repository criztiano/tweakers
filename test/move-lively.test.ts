import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { spring } from 'motion';
import {
  LIVELY_CSS, LIVELY_PRESS, LIVELY_SURFACE, LIVELY_UI, LIVELY_STAGGER, LIVELY_STAGGER_MAX, livelyStagger,
} from '../src/move-lively';

const theme = readFileSync(new URL('../src/styles/theme.css', import.meta.url), 'utf8');

describe('Lively springs as CSS', () => {
  const springs = { press: LIVELY_PRESS, ui: LIVELY_UI, surface: LIVELY_SURFACE } as const;

  for (const [name, s] of Object.entries(springs) as [keyof typeof springs, typeof LIVELY_UI][]) {
    it(`${name} matches what Motion generates for the same spring`, () => {
      const css = LIVELY_CSS[name];
      expect(`${css.duration} ${css.easing}`).toBe(spring(s.visualDuration, s.bounce).toString());
    });

    it(`${name} is the same string in theme.css`, () => {
      expect(theme).toContain(`--move-spring-${name}: ${LIVELY_CSS[name].easing};`);
      expect(theme).toContain(`--move-spring-${name}-duration: ${LIVELY_CSS[name].duration};`);
    });
  }
});

describe('livelyStagger', () => {
  it('steps each child by the stagger', () => {
    expect(livelyStagger(0, 4)).toBe(0);
    expect(livelyStagger(2, 4)).toBeCloseTo(2 * LIVELY_STAGGER);
  });

  it('keeps a long run within the cap', () => {
    expect(livelyStagger(19, 20)).toBeCloseTo(LIVELY_STAGGER_MAX);
    expect(livelyStagger(50, 20)).toBeCloseTo(LIVELY_STAGGER_MAX);
  });
});
