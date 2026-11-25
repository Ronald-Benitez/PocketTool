import packageJson from '../../../package.json';
import { translate } from '@/src/lang/translate';
import { RELEASE_NOTES } from '../catalog';
import { compareVersions } from '../versions';

describe('release notes catalog', () => {
  it('has unique versions ordered from oldest to newest', () => {
    const versions = RELEASE_NOTES.map((note) => note.version);

    expect(new Set(versions).size).toBe(versions.length);

    for (let index = 1; index < versions.length; index += 1) {
      expect(compareVersions(versions[index - 1], versions[index])).toBe(-1);
    }
  });

  it('includes the current app version', () => {
    expect(
      RELEASE_NOTES.some((note) => note.version === packageJson.version)
    ).toBe(true);
  });

  it('has at least one item per version', () => {
    for (const note of RELEASE_NOTES) {
      expect(note.items.length).toBeGreaterThan(0);
    }
  });

  it('resolves every item title and body in both languages', () => {
    for (const note of RELEASE_NOTES) {
      for (const item of note.items) {
        expect(translate('en', item.titleKey)).not.toBe(item.titleKey);
        expect(translate('es', item.titleKey)).not.toBe(item.titleKey);
        expect(translate('en', item.bodyKey)).not.toBe(item.bodyKey);
        expect(translate('es', item.bodyKey)).not.toBe(item.bodyKey);
      }
    }
  });
});
