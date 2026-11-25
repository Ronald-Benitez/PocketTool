import {
  classifyObligationDate,
  groupObligationsByUrgency,
  sortObligations,
} from '../obligations';

const DAY_MS = 24 * 60 * 60 * 1000;

const atNoon = (offsetDays = 0) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  return date.getTime() + offsetDays * DAY_MS;
};

const now = atNoon(0);

describe('classifyObligationDate', () => {
  it('classifies today regardless of the time', () => {
    expect(classifyObligationDate({ date: atNoon(0), now })).toBe('today');
    const start = new Date(now);
    start.setHours(0, 1, 0, 0);
    expect(classifyObligationDate({ date: start.getTime(), now })).toBe('today');
  });

  it('classifies previous calendar days as overdue', () => {
    expect(classifyObligationDate({ date: atNoon(-1), now })).toBe('overdue');
    expect(classifyObligationDate({ date: atNoon(-30), now })).toBe('overdue');
  });

  it('classifies the next seven days as soon by default', () => {
    expect(classifyObligationDate({ date: atNoon(1), now })).toBe('soon');
    expect(classifyObligationDate({ date: atNoon(7), now })).toBe('soon');
    expect(classifyObligationDate({ date: atNoon(8), now })).toBe('later');
  });

  it('respects a custom horizon', () => {
    expect(
      classifyObligationDate({ date: atNoon(1), now, horizonDays: 0 })
    ).toBe('later');
    expect(
      classifyObligationDate({ date: atNoon(3), now, horizonDays: 2 })
    ).toBe('later');
    expect(
      classifyObligationDate({ date: atNoon(2), now, horizonDays: 2 })
    ).toBe('soon');
  });
});

describe('sortObligations', () => {
  it('orders by urgency and then by date without mutating input', () => {
    const items = [
      { id: 'later', date: atNoon(20) },
      { id: 'soon', date: atNoon(5) },
      { id: 'today', date: atNoon(0) },
      { id: 'overdue', date: atNoon(-2) },
    ];

    const sorted = sortObligations(items, now);

    expect(sorted.map((item) => item.id)).toEqual([
      'overdue',
      'today',
      'soon',
      'later',
    ]);
    expect(items.map((item) => item.id)).toEqual([
      'later',
      'soon',
      'today',
      'overdue',
    ]);
  });

  it('breaks ties by date ascending', () => {
    const items = [
      { id: 'later-date', date: atNoon(3) },
      { id: 'early-date', date: atNoon(1) },
    ];
    expect(sortObligations(items, now).map((item) => item.id)).toEqual([
      'early-date',
      'later-date',
    ]);
  });
});

describe('groupObligationsByUrgency', () => {
  it('groups consecutive buckets and omits empty ones', () => {
    const groups = groupObligationsByUrgency(
      [
        { id: 'today', date: atNoon(0) },
        { id: 'soon', date: atNoon(2) },
        { id: 'overdue', date: atNoon(-1) },
      ],
      now
    );

    expect(groups.map((group) => group.urgency)).toEqual([
      'overdue',
      'today',
      'soon',
    ]);
    expect(groups.flatMap((group) => group.items)).toHaveLength(3);
  });
});
