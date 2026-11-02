export const VEHICLE_TYPES = [
  'sedan',
  'suv',
  'pickup',
  'camioneta',
  'motorcycle',
  'bus',
  'microbus',
  'camion',
  'furgon',
  'tractor',
  'retroexcavadora',
  'excavadora',
  'cargador',
  'grua',
  'other',
] as const;

export type VehicleType = (typeof VEHICLE_TYPES)[number];

/**
 * Visual reference used by the vehicle illustrations. A null value means the
 * type uses a generic model, not a specific brand/model.
 */
export const VEHICLE_TYPE_REFERENCES: Record<VehicleType, string | null> = {
  sedan: 'Mazda 3',
  suv: 'Suzuki Jimny',
  pickup: 'Toyota Hilux',
  camioneta: 'Nissan Rogue',
  motorcycle: 'Honda Navi',
  bus: null,
  microbus: 'Toyota Hiace',
  camion: null,
  furgon: null,
  tractor: 'John Deere',
  retroexcavadora: null,
  excavadora: null,
  cargador: null,
  grua: null,
  other: null,
};

export const normalizeVehicleType = (value?: string | null): VehicleType => {
  if (value === 'car') return 'sedan';
  if (value === 'van') return 'furgon';
  return (VEHICLE_TYPES as readonly string[]).includes(value ?? '')
    ? (value as VehicleType)
    : 'other';
};

export const vehicleReferenceModel = (
  type: string | null | undefined,
  genericLabel: string
) => {
  const normalized = normalizeVehicleType(type);
  return VEHICLE_TYPE_REFERENCES[normalized] ?? genericLabel;
};
