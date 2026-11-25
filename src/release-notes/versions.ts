export type VersionedReleaseNote = {
  version: string;
};

export type PendingReleaseNoteOptions = {
  /**
   * First version that introduces the release notes screen. When there is no
   * stored version, that release is shown once to support users coming from an
   * older build without the feature.
   */
  launchExceptionVersion?: string;
};

const VERSION_PATTERN = /^\d+(?:\.\d+)*$/;

export const parseVersion = (version: string | null | undefined): number[] | null => {
  if (!version) return null;
  const trimmed = version.trim();
  if (!VERSION_PATTERN.test(trimmed)) return null;
  return trimmed.split('.').map((part) => Number(part));
};

export const compareVersions = (
  leftVersion: string | null | undefined,
  rightVersion: string | null | undefined
): number => {
  const left = parseVersion(leftVersion);
  const right = parseVersion(rightVersion);

  if (!left && !right) return 0;
  if (!left) return -1;
  if (!right) return 1;

  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    const leftPart = left[index] ?? 0;
    const rightPart = right[index] ?? 0;
    if (leftPart !== rightPart) {
      return leftPart < rightPart ? -1 : 1;
    }
  }

  return 0;
};

export const sortReleaseNotes = <T extends VersionedReleaseNote>(notes: T[]): T[] =>
  [...notes].sort((a, b) => compareVersions(a.version, b.version));

export const isVersionInCatalog = <T extends VersionedReleaseNote>(
  notes: T[],
  version: string | null | undefined
): boolean =>
  Boolean(version) &&
  notes.some((note) => compareVersions(note.version, version) === 0);

/**
 * Returns the catalog versions that the user has not seen yet, from the oldest
 * pending version to the current one. An invalid or missing current version
 * never shows notes.
 */
export const selectPendingReleaseNotes = <T extends VersionedReleaseNote>(
  notes: T[],
  currentVersion: string | null | undefined,
  lastSeenVersion: string | null | undefined,
  options: PendingReleaseNoteOptions = {}
): T[] => {
  if (!parseVersion(currentVersion)) return [];

  const sorted = sortReleaseNotes(notes);
  const current = currentVersion?.trim() ?? '';

  if (!isVersionInCatalog(sorted, current)) return [];

  const hasSeenVersion = Boolean(parseVersion(lastSeenVersion));
  const seen = hasSeenVersion ? lastSeenVersion?.trim() ?? '' : '';

  if (!hasSeenVersion) {
    const launchException = options.launchExceptionVersion;
    const isLaunchRelease =
      Boolean(launchException) &&
      compareVersions(current, launchException) === 0;

    return isLaunchRelease
      ? sorted.filter((note) => compareVersions(note.version, current) <= 0)
      : [];
  }

  if (compareVersions(current, seen) <= 0) return [];

  return sorted.filter(
    (note) =>
      compareVersions(note.version, seen) > 0 &&
      compareVersions(note.version, current) <= 0
  );
};
