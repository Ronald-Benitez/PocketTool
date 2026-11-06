import {
  normalizeVehicleType,
  vehicleReferenceModel,
} from '../models';

describe('vehicle models', () => {
  it('normalizes legacy vehicle types', () => {
    expect(normalizeVehicleType('car')).toBe('sedan');
    expect(normalizeVehicleType('van')).toBe('furgon');
    expect(normalizeVehicleType('unknown')).toBe('other');
  });

  it('returns the visual reference for each type', () => {
    expect(vehicleReferenceModel('sedan', 'Generic')).toBe('Mazda 3');
    expect(vehicleReferenceModel('pickup', 'Generic')).toBe('Toyota Hilux');
    expect(vehicleReferenceModel('suv', 'Generic')).toBe('Suzuki Jimny');
    expect(vehicleReferenceModel('microbus', 'Generic')).toBe('Toyota Hiace');
    expect(vehicleReferenceModel('tractor', 'Generic')).toBe('John Deere');
    expect(vehicleReferenceModel('bus', 'Generic')).toBe('Generic');
  });
});
