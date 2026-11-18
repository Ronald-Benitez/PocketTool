import {
  compareVersions,
  isVersionInCatalog,
  parseVersion,
  selectPendingReleaseNotes,
  sortReleaseNotes,
} from '../versions';

const note = (version: string) => ({ version });

describe('release note versions', () => {
  it('parses numeric versions', () => {
    expect(parseVersion('4.0.5')).toEqual([4, 0, 5]);
    expect(parseVersion(' 4.0.5 ')).toEqual([4, 0, 5]);
    expect(parseVersion('4.0.5-beta')).toBeNull();
    expect(parseVersion('')).toBeNull();
    expect(parseVersion(null)).toBeNull();
  });

  it('compares versions segment by segment', () => {
    expect(compareVersions('4.0.10', '4.0.9')).toBe(1);
    expect(compareVersions('4.0.9', '4.0.10')).toBe(-1);
    expect(compareVersions('4.0.5', '4.0.5.0')).toBe(0);
    expect(compareVersions('4.1.0', '4.0.99')).toBe(1);
  });

  it('sorts notes from oldest to newest', () => {
    const sorted = sortReleaseNotes([
      note('4.0.7'),
      note('4.0.5'),
      note('4.0.10'),
      note('4.0.6'),
    ]);

    expect(sorted.map((item) => item.version)).toEqual([
      '4.0.5',
      '4.0.6',
      '4.0.7',
      '4.0.10',
    ]);
  });

  it('detects whether a version is in the catalog', () => {
    const notes = [note('4.0.5'), note('4.0.6')];

    expect(isVersionInCatalog(notes, '4.0.5')).toBe(true);
    expect(isVersionInCatalog(notes, '4.0.7')).toBe(false);
    expect(isVersionInCatalog(notes, null)).toBe(false);
  });

  it('shows nothing after a fresh install beyond the launch exception', () => {
    const notes = [note('4.0.5'), note('4.0.6')];

    expect(selectPendingReleaseNotes(notes, '4.0.6', null)).toEqual([]);
    expect(
      selectPendingReleaseNotes(notes, '4.0.6', null, {
        launchExceptionVersion: '4.0.5',
      })
    ).toEqual([]);
  });

  it('shows the launch exception once when no version was stored', () => {
    const notes = [note('4.0.5')];

    expect(
      selectPendingReleaseNotes(notes, '4.0.5', null, {
        launchExceptionVersion: '4.0.5',
      })
    ).toEqual([note('4.0.5')]);
  });

  it('does not repeat notes for the stored version', () => {
    const notes = [note('4.0.5'), note('4.0.6')];

    expect(selectPendingReleaseNotes(notes, '4.0.6', '4.0.6')).toEqual([]);
  });

  it('accumulates every pending version', () => {
    const notes = [
      note('4.0.5'),
      note('4.0.6'),
      note('4.0.7'),
      note('4.0.8'),
    ];

    expect(selectPendingReleaseNotes(notes, '4.0.7', '4.0.4')).toEqual([
      note('4.0.5'),
      note('4.0.6'),
      note('4.0.7'),
    ]);
  });

  it('ignores versions newer than the installed one', () => {
    const notes = [note('4.0.5'), note('4.0.6')];

    expect(selectPendingReleaseNotes(notes, '4.0.5', '4.0.4')).toEqual([
      note('4.0.5'),
    ]);
  });

  it('shows nothing on a downgrade', () => {
    const notes = [note('4.0.5'), note('4.0.6')];

    expect(selectPendingReleaseNotes(notes, '4.0.5', '4.0.6')).toEqual([]);
  });

  it('shows nothing when the current version is absent from the catalog', () => {
    const notes = [note('4.0.5'), note('4.0.6')];

    expect(selectPendingReleaseNotes(notes, '4.0.8', '4.0.6')).toEqual([]);
  });

  it('ignores an invalid stored version and can use the launch exception', () => {
    const notes = [note('4.0.5')];

    expect(
      selectPendingReleaseNotes(notes, '4.0.5', 'not-a-version', {
        launchExceptionVersion: '4.0.5',
      })
    ).toEqual([note('4.0.5')]);
  });
});
