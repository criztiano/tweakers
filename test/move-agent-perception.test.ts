import { describe, expect, it } from 'vitest';
import { formatAgentTime, formatEntries, projectEntries, resolveBoundary, timelineToSource, type MoveAgentEntry, type MoveAgentProjectedEntry, type MoveAgentSegment } from '../src/move-agent-perception';

const shot = (n: number, t0: number, t1: number, label?: string): MoveAgentEntry => ({ id: `shot:${n}`, type: 'shot', source: 'a.mov', t0, t1, label });
const bar = (n: number, t0: number): MoveAgentEntry => ({ id: `bar:${n}`, type: 'bar', source: 'a.mov', t0 });

describe('the projection: entries × edit map', () => {
  it('shifts an entry that sits whole inside a segment, and keeps its source times', () => {
    const [e] = projectEntries([shot(1, 12, 15, 'beach')], [{ source: 'a.mov', srcIn: 10, srcOut: 20, at: 100 }]);
    expect(e).toEqual({ id: 'shot:1', type: 'shot', source: 'a.mov', t0: 12, t1: 15, label: 'beach', at0: 102, at1: 105 });
    expect('partial' in e).toBe(false);
  });

  it('clips an entry a segment edge runs through, at either edge or both, and marks it partial', () => {
    const segments: MoveAgentSegment[] = [{ source: 'a.mov', srcIn: 10, srcOut: 20, at: 0 }];
    const [head, both, tail] = projectEntries([shot(1, 8, 12), shot(2, 18, 25), shot(3, 5, 30)], segments);
    expect(head).toMatchObject({ id: 'shot:1', at0: 0, at1: 2, partial: true, t0: 8, t1: 12 });
    expect(both).toMatchObject({ id: 'shot:3', at0: 0, at1: 10, partial: true });
    expect(tail).toMatchObject({ id: 'shot:2', at0: 8, at1: 10, partial: true });
  });

  it('leaves out what no segment holds — another source, a removed range, a span that only touches the edge', () => {
    const segments: MoveAgentSegment[] = [{ source: 'a.mov', srcIn: 10, srcOut: 20, at: 0 }];
    expect(projectEntries([shot(1, 0, 10), shot(2, 20, 30), shot(3, 40, 50), { ...shot(4, 12, 14), source: 'b.mov' }], segments)).toEqual([]);
  });

  it('gives an entry twice when the edit plays its source range twice, told apart by at0', () => {
    const segments: MoveAgentSegment[] = [{ source: 'a.mov', srcIn: 10, srcOut: 20, at: 0 }, { source: 'a.mov', srcIn: 10, srcOut: 20, at: 30 }];
    const twice = projectEntries([shot(1, 12, 15)], segments);
    expect(twice.map((e) => [e.id, e.at0, e.at1])).toEqual([['shot:1', 2, 5], ['shot:1', 32, 35]]);
  });

  it('scales by the rate of the segment', () => {
    const fast = projectEntries([shot(1, 12, 16), bar(1, 14)], [{ source: 'a.mov', srcIn: 10, srcOut: 20, at: 100, rate: 2 }]);
    expect(fast.map((e) => [e.id, e.at0, e.at1])).toEqual([['shot:1', 101, 103], ['bar:1', 102, undefined]]);
    const slow = projectEntries([shot(1, 12, 16)], [{ source: 'a.mov', srcIn: 10, srcOut: 20, at: 0, rate: 0.5 }]);
    expect(slow[0]).toMatchObject({ at0: 4, at1: 12 });
  });

  it('gives a moment to the segment it starts in, so two pieces cut at one spot do not share it', () => {
    const segments: MoveAgentSegment[] = [{ source: 'a.mov', srcIn: 0, srcOut: 10, at: 0 }, { source: 'a.mov', srcIn: 10, srcOut: 20, at: 10 }];
    expect(projectEntries([bar(1, 0), bar(2, 10), bar(3, 20)], segments).map((e) => [e.id, e.at0])).toEqual([['bar:1', 0], ['bar:2', 10]]);
  });

  it('sorts by timeline time when the edit reorders the source', () => {
    const segments: MoveAgentSegment[] = [{ source: 'a.mov', srcIn: 30, srcOut: 40, at: 0 }, { source: 'a.mov', srcIn: 0, srcOut: 10, at: 10 }];
    expect(projectEntries([shot(1, 2, 4), shot(2, 32, 34)], segments).map((e) => e.id)).toEqual(['shot:2', 'shot:1']);
  });

  it('holds nothing under an empty map, and steps over a segment that makes no sense', () => {
    expect(projectEntries([shot(1, 0, 5)], [])).toEqual([]);
    expect(projectEntries([shot(1, 0, 5)], [{ source: 'a.mov', srcIn: 10, srcOut: 10, at: 0 }, { source: 'a.mov', srcIn: 9, srcOut: 2, at: 0 }])).toEqual([]);
    expect(projectEntries([shot(1, 0, 5)], [{ source: 'a.mov', srcIn: 0, srcOut: 10, at: 0, rate: 0 }])[0]).toMatchObject({ at0: 0, at1: 5 });
  });
});

describe('the way back: timeline range → source ranges', () => {
  const segments: MoveAgentSegment[] = [
    { source: 'a.mov', srcIn: 10, srcOut: 20, at: 0 },
    { source: 'b.mov', srcIn: 0, srcOut: 10, at: 10, rate: 2 },       // plays 10–15
    { source: 'a.mov', srcIn: 40, srcOut: 50, at: 15 },
  ];

  it('cuts the range where the segments cut it, and undoes the rate', () => {
    expect(timelineToSource({ from: 8, to: 17 }, segments)).toEqual([
      { source: 'a.mov', t0: 18, t1: 20 },
      { source: 'a.mov', t0: 40, t1: 42 },
      { source: 'b.mov', t0: 0, t1: 10 },
    ]);
    expect(timelineToSource({ from: 11, to: 12 }, segments)).toEqual([{ source: 'b.mov', t0: 2, t1: 4 }]);
  });

  it('takes the whole edit for no range, and to the edge for an open end', () => {
    expect(timelineToSource(undefined, segments)).toHaveLength(3);
    expect(timelineToSource({ from: 20 }, segments)).toEqual([{ source: 'a.mov', t0: 45, t1: 50 }]);
    expect(timelineToSource({ to: 1 }, segments)).toEqual([{ source: 'a.mov', t0: 10, t1: 11 }]);
  });

  it('joins source ranges that touch or overlap, and finds nothing outside the edit', () => {
    const doubled: MoveAgentSegment[] = [{ source: 'a.mov', srcIn: 0, srcOut: 10, at: 0 }, { source: 'a.mov', srcIn: 5, srcOut: 15, at: 10 }, { source: 'a.mov', srcIn: 15, srcOut: 18, at: 20 }];
    expect(timelineToSource(undefined, doubled)).toEqual([{ source: 'a.mov', t0: 0, t1: 18 }]);
    expect(timelineToSource({ from: 100, to: 120 }, segments)).toEqual([]);
    expect(timelineToSource({ from: 0, to: 10 }, [])).toEqual([]);
  });

  it('is the inverse of the projection', () => {
    const [range] = timelineToSource({ from: 11, to: 12 }, segments);
    const [back] = projectEntries([{ id: 'x', type: 'event', ...range }], segments);
    expect(back).toMatchObject({ at0: 11, at1: 12 });
    expect(back.partial).toBeUndefined();
  });
});

describe('the lines the agent reads', () => {
  it('writes one time format everywhere', () => {
    expect(formatAgentTime(72.48)).toBe('01:12.480');
    expect(formatAgentTime(0)).toBe('00:00.000');
    expect(formatAgentTime(59.9996)).toBe('01:00.000');   // rounded before it is split, never 00:60.000
    expect(formatAgentTime(3725.5)).toBe('62:05.500');
  });

  it('puts an entry on a line: id, type, times, label, partial', () => {
    const projected: MoveAgentProjectedEntry[] = [
      { ...shot(14, 0, 0, 'beach, two people'), at0: 72.48, at1: 75.2, partial: true },
      { ...bar(17, 0), at0: 80 },
      { id: 'tag:3', type: 'tag', source: 'a.mov', t0: 0, at0: 90, at1: 91, label: 'sea', score: 0.8234 },
    ];
    expect(formatEntries(projected).split('\n')).toEqual([
      'shot:14 | shot | 01:12.480–01:15.200 | beach, two people | partial',
      'bar:17 | bar | 01:20.000',
      'tag:3 | tag | 01:30.000–01:31.000 | sea | score 0.82',
    ]);
  });

  it('stops at the cap and counts the rest', () => {
    const many = Array.from({ length: 130 }, (_, i): MoveAgentProjectedEntry => ({ ...bar(i, i), at0: i }));
    const lines = formatEntries(many).split('\n');
    expect(lines).toHaveLength(121);
    expect(lines[120]).toBe('10 more — narrow the range');
    expect(formatEntries(many, { limit: 2 }).split('\n')).toEqual(['bar:0 | bar | 00:00.000', 'bar:1 | bar | 00:01.000', '128 more — narrow the range']);
    expect(formatEntries(many.slice(0, 120))).not.toContain('more');
  });

  it('keeps the entries that hold a word of the query — in label, id or type, whatever the case — before the cap', () => {
    const projected = ['Beach, two people', 'interview', 'the BEACH at dusk', undefined].map((label, i): MoveAgentProjectedEntry => ({ ...shot(i, 0, 1, label), at0: i, at1: i + 1 }));
    const ids = (text: string) => text.split('\n').map((l) => l.split(' | ')[0]);
    expect(ids(formatEntries(projected, { query: 'beach' }))).toEqual(['shot:0', 'shot:2']);
    expect(ids(formatEntries(projected, { query: 'dusk, interview' }))).toEqual(['shot:1', 'shot:2']);
    expect(ids(formatEntries(projected, { query: 'shot:3' }))[0]).toBe('shot:3');                                  // "shot" is in every id; both words in one
    expect(ids(formatEntries([...projected, { ...bar(1, 0), at0: 9 }], { query: 'bar' }))).toEqual(['bar:1']);
    expect(formatEntries(projected, { query: 'beach', limit: 1 }).split('\n')[1]).toBe('1 more — narrow the range');
    expect(formatEntries(projected, { query: '  ' }).split('\n')).toHaveLength(4);
  });

  it('is forgiving: small words are ignored, and the entries that hold every word come first', () => {
    const vocal = (n: number, label: string): MoveAgentProjectedEntry => ({ id: `vocal_in:${n}`, type: 'event', source: 'a.mov', t0: n, at0: n, label });
    const projected = [vocal(1, 'drums enter'), vocal(2, 'vocals enter'), vocal(3, 'in the mix'), vocal(4, 'the vocals enter again')];
    const ids = (text: string) => text.split('\n').map((l) => l.split(' | ')[0]);
    expect(ids(formatEntries(projected, { query: 'vocals in' }))).toEqual(['vocal_in:2', 'vocal_in:4']);          // "in" alone matches nothing
    expect(ids(formatEntries(projected, { query: 'vocals again' }))).toEqual(['vocal_in:4', 'vocal_in:2']);       // both words first
    expect(ids(formatEntries(projected, { query: 'in the' }))).toEqual(['vocal_in:3', 'vocal_in:4', 'vocal_in:1', 'vocal_in:2']);   // only small words: they are the query, and "in" is in every id
  });

  it('gives the whole list under a line that says so when the query finds nothing, so "not here" is an answer', () => {
    expect(formatEntries([])).toBe('Nothing here.');
    expect(formatEntries([], { query: 'beach' })).toBe('Nothing here.');
    const projected: MoveAgentProjectedEntry[] = [{ ...shot(1, 0, 1, 'interview'), at0: 0, at1: 1 }, { ...shot(2, 1, 2, 'street'), at0: 1, at1: 2 }];
    expect(formatEntries(projected, { query: 'beach' }).split('\n')).toEqual([
      'Nothing matches "beach" — this is everything in the range:',
      'shot:1 | shot | 00:00.000–00:01.000 | interview',
      'shot:2 | shot | 00:01.000–00:02.000 | street',
    ]);
    expect(formatEntries(projected, { query: 'beach', limit: 1 }).split('\n')).toHaveLength(3);
  });
});

describe('a boundary, resolved', () => {
  const known = [shot(14, 12, 15), bar(17, 13)];
  const segments: MoveAgentSegment[] = [{ source: 'a.mov', srcIn: 10, srcOut: 20, at: 100 }];

  it('takes the time from the entry, exactly, and carries it through the edit', () => {
    expect(resolveBoundary({ entry: 'shot:14', edge: 'start' }, known, segments)).toEqual({ entry: 'shot:14', edge: 'start', source: 'a.mov', sourceTime: 12, time: 102 });
    expect(resolveBoundary({ entry: 'shot:14', edge: 'end' }, known, segments)).toMatchObject({ sourceTime: 15, time: 105 });
    expect(resolveBoundary({ entry: 'bar:17', edge: 'end' }, known, segments)).toMatchObject({ sourceTime: 13, time: 103 });   // a moment has one edge
    expect(resolveBoundary({ entry: 'shot:14', edge: 'end' }, known, [{ ...segments[0], rate: 2 }])).toMatchObject({ time: 102.5 });
  });

  it('resolves nothing for an id nobody has seen, or an edge that is neither', () => {
    expect(resolveBoundary({ entry: 'shot:99', edge: 'start' }, known, segments)).toBeUndefined();
    expect(resolveBoundary({ entry: 'shot:14', edge: 'middle' as 'start' }, known, segments)).toBeUndefined();
    expect(resolveBoundary({ entry: 'shot:14', edge: 'start' }, [], segments)).toBeUndefined();
  });

  it('keeps the source time and leaves the timeline time out when the edit does not hold that moment', () => {
    const cutOff = resolveBoundary({ entry: 'shot:14', edge: 'start' }, [shot(14, 8, 12)], segments)!;
    expect(cutOff).toEqual({ entry: 'shot:14', edge: 'start', source: 'a.mov', sourceTime: 8 });
    expect(resolveBoundary({ entry: 'shot:14', edge: 'end' }, [shot(14, 8, 12)], segments)).toMatchObject({ time: 102 });
    const emptied = resolveBoundary({ entry: 'shot:14', edge: 'start' }, known, [])!;
    expect(emptied.sourceTime).toBe(12);
    expect(emptied.time).toBeUndefined();
  });

  it('reads the timeline as the source when the host has no edit map', () => {
    expect(resolveBoundary({ entry: 'shot:14', edge: 'end' }, known)).toMatchObject({ sourceTime: 15, time: 15 });
  });

  it('at a cut, a start opens the piece after it and an end closes the piece before it', () => {
    const cut: MoveAgentSegment[] = [{ source: 'a.mov', srcIn: 0, srcOut: 12, at: 0 }, { source: 'a.mov', srcIn: 12, srcOut: 20, at: 50 }];
    expect(resolveBoundary({ entry: 'shot:14', edge: 'start' }, known, cut)).toMatchObject({ time: 50 });
    expect(resolveBoundary({ entry: 'shot:1', edge: 'end' }, [shot(1, 5, 12)], cut)).toMatchObject({ time: 12 });
  });

  it('takes the first place when the edit plays the moment twice, and the source the edit holds when two share an id', () => {
    const twice: MoveAgentSegment[] = [{ source: 'a.mov', srcIn: 10, srcOut: 20, at: 30 }, { source: 'a.mov', srcIn: 10, srcOut: 20, at: 0 }];
    expect(resolveBoundary({ entry: 'shot:14', edge: 'start' }, known, twice)).toMatchObject({ time: 2 });
    const other = { ...shot(14, 1, 2), source: 'b.mov' };
    expect(resolveBoundary({ entry: 'shot:14', edge: 'start' }, [other, ...known], segments)).toMatchObject({ source: 'a.mov', time: 102 });
  });
});
