import { isHexColor, withAlpha } from '../color';

describe('withAlpha', () => {
  it('adds an alpha channel to six-digit colors', () => {
    expect(withAlpha('#45ADBF', 0.35)).toBe('#45ADBF59');
    expect(withAlpha('#45adbf', 1)).toBe('#45ADBFFF');
    expect(withAlpha('#45ADBF', 0)).toBe('#45ADBF00');
  });

  it('expands three- and four-digit colors', () => {
    expect(withAlpha('#fff', 0.5)).toBe('#FFFFFF80');
    expect(withAlpha('#abcd', 0.5)).toBe('#AABBCC80');
    expect(withAlpha('#f00', 1)).toBe('#FF0000FF');
  });

  it('replaces an existing alpha channel', () => {
    expect(withAlpha('#45ADBF80', 0.25)).toBe('#45ADBF40');
    expect(withAlpha('#abcd', 1)).toBe('#AABBCCFF');
  });

  it('clamps alpha outside the 0..1 range', () => {
    expect(withAlpha('#000000', -1)).toBe('#00000000');
    expect(withAlpha('#000000', 2)).toBe('#000000FF');
  });

  it('returns unsupported formats unchanged', () => {
    expect(withAlpha('red', 0.5)).toBe('red');
    expect(withAlpha('rgb(0, 0, 0)', 0.5)).toBe('rgb(0, 0, 0)');
    expect(withAlpha('transparent', 0.5)).toBe('transparent');
  });

  it('trims surrounding whitespace', () => {
    expect(withAlpha(' #fff ', 0.5)).toBe('#FFFFFF80');
  });
});

describe('isHexColor', () => {
  it('accepts supported hex lengths only', () => {
    expect(isHexColor('#fff')).toBe(true);
    expect(isHexColor('#abcd')).toBe(true);
    expect(isHexColor('#aabbcc')).toBe(true);
    expect(isHexColor('#aabbccdd')).toBe(true);
    expect(isHexColor('#ff')).toBe(false);
    expect(isHexColor('#fffff')).toBe(false);
    expect(isHexColor('white')).toBe(false);
  });
});
