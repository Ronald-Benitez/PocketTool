import type {
  ConsumptionFormat,
  DistanceUnit,
  FuelMetrics,
  VolumeUnit,
} from './types';

export const KM_PER_MILE = 1.609344;
export const LITERS_PER_GALLON = 3.785411784;

export const distanceUnitOf = (value?: string | null): DistanceUnit =>
  value === 'km' ? 'km' : 'mi';

export const volumeUnitOf = (value?: string | null): VolumeUnit =>
  value === 'L' ? 'L' : 'gal';

export const toKm = (value: number, unit: DistanceUnit) =>
  unit === 'mi' ? value * KM_PER_MILE : value;

export const fromKm = (value: number, unit: DistanceUnit) =>
  unit === 'mi' ? value / KM_PER_MILE : value;

export const toLiters = (value: number, unit: VolumeUnit) =>
  unit === 'gal' ? value * LITERS_PER_GALLON : value;

export const fromLiters = (value: number, unit: VolumeUnit) =>
  unit === 'gal' ? value / LITERS_PER_GALLON : value;

export const convertDistance = (
  value: number,
  from: DistanceUnit,
  to: DistanceUnit
) => (from === to ? value : to === 'km' ? value * KM_PER_MILE : value / KM_PER_MILE);

export const convertVolume = (
  value: number,
  from: VolumeUnit,
  to: VolumeUnit
) => (from === to ? value : to === 'L' ? value * LITERS_PER_GALLON : value / LITERS_PER_GALLON);

export const convertPricePerUnit = (
  value: number,
  from: VolumeUnit,
  to: VolumeUnit
) => (from === to ? value : to === 'L' ? value / LITERS_PER_GALLON : value * LITERS_PER_GALLON);

export type ThirdValueMode = 'total' | 'price' | 'volume';

export const calculateThirdValue = ({
  mode,
  volume,
  pricePerUnit,
  total,
}: {
  mode: ThirdValueMode;
  volume?: number | null;
  pricePerUnit?: number | null;
  total?: number | null;
}) => {
  if (mode === 'total' && volume != null && pricePerUnit != null) {
    return Math.round(volume * pricePerUnit);
  }
  if (mode === 'price' && volume != null && total != null && volume > 0) {
    return Math.round(total / volume);
  }
  if (mode === 'volume' && pricePerUnit != null && total != null && pricePerUnit > 0) {
    return Math.round((total / pricePerUnit) * 10000) / 10000;
  }
  return null;
};

export const hasConsistentTotals = ({
  volume,
  pricePerUnit,
  total,
}: {
  volume: number;
  pricePerUnit: number;
  total: number;
}) => {
  const expected = volume * pricePerUnit;
  const tolerance = Math.max(1, volume * 0.01);
  return Math.abs(expected - total) <= tolerance;
};

export const buildFuelMetrics = ({
  distanceKm,
  volumeL,
  totalCost,
}: {
  distanceKm: number;
  volumeL: number;
  totalCost: number;
}): FuelMetrics | null => {
  if (distanceKm <= 0 || volumeL <= 0) return null;

  const distanceMi = distanceKm / KM_PER_MILE;
  const volumeGal = volumeL / LITERS_PER_GALLON;

  return {
    distanceKm,
    volumeL,
    miPerGal: distanceMi / volumeGal,
    kmPerGal: distanceKm / volumeGal,
    miPerL: distanceMi / volumeL,
    kmPerL: distanceKm / volumeL,
    lPer100km: (volumeL / distanceKm) * 100,
    galPer100km: (volumeGal / distanceKm) * 100,
    lPer60mi: (volumeL / distanceMi) * 60,
    galPer60mi: (volumeGal / distanceMi) * 60,
    costPerKm: totalCost / 100 / distanceKm,
    costPerMi: totalCost / 100 / distanceMi,
    pricePerGal: totalCost / 100 / volumeGal,
    pricePerL: totalCost / 100 / volumeL,
  };
};

export const selectConsumption = (
  metrics: FuelMetrics | null,
  format: ConsumptionFormat
) => {
  if (!metrics) return null;
  switch (format) {
    case 'mi_gal':
      return metrics.miPerGal;
    case 'km_gal':
      return metrics.kmPerGal;
    case 'mi_l':
      return metrics.miPerL;
    case 'km_l':
      return metrics.kmPerL;
    case 'l_100km':
      return metrics.lPer100km;
    case 'gal_100km':
      return metrics.galPer100km;
    case 'l_60mi':
      return metrics.lPer60mi;
    case 'gal_60mi':
      return metrics.galPer60mi;
    default:
      return metrics.kmPerL;
  }
};

export const consumptionUnits = (format: ConsumptionFormat) => {
  switch (format) {
    case 'mi_gal':
      return 'mi/gal';
    case 'km_gal':
      return 'km/gal';
    case 'mi_l':
      return 'mi/L';
    case 'km_l':
      return 'km/L';
    case 'l_100km':
      return 'L/100 km';
    case 'gal_100km':
      return 'gal/100 km';
    case 'l_60mi':
      return 'L/60 mi';
    case 'gal_60mi':
      return 'gal/60 mi';
    default:
      return 'km/L';
  }
};

export const lowerIsBetter = (format: ConsumptionFormat) =>
  format === 'l_100km' ||
  format === 'gal_100km' ||
  format === 'l_60mi' ||
  format === 'gal_60mi';
