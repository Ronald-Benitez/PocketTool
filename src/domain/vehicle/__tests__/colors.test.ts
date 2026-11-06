import {
  isHexColor,
  resolveVehicleColor,
  shadeVehicleColor,
} from '../colors';

describe('vehicle colors', () => {
  it('resolves hex and named colors', () => {
    expect(isHexColor('#abc')).toBe(true);
    expect(resolveVehicleColor('#abc')).toBe('#AABBCC');
    expect(resolveVehicleColor('Rojo')).toBe('#DC2626');
    expect(resolveVehicleColor('Azul océano')).toBe('#2563EB');
  });

  it('derives a stable color from arbitrary text', () => {
    const first = resolveVehicleColor('Mi carro especial');
    const second = resolveVehicleColor('Mi carro especial');
    expect(first).toMatch(/^#[0-9A-F]{6}$/);
    expect(second).toBe(first);
  });

  it('shades a color', () => {
    expect(shadeVehicleColor('#808080', -0.2)).toBe('#4D4D4D');
    expect(shadeVehicleColor('#808080', 0.2)).toBe('#B3B3B3');
  });
});
