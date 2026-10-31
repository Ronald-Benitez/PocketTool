export type DistanceUnit = 'mi' | 'km';
export type VolumeUnit = 'gal' | 'L';
export type ConsumptionFormat =
  | 'mi_gal'
  | 'km_gal'
  | 'mi_l'
  | 'km_l'
  | 'l_100km'
  | 'gal_100km'
  | 'l_60mi'
  | 'gal_60mi';

export type FuelEntryLike = {
  id?: number;
  vehicle_id: number;
  date: number;
  odometer?: number | null;
  odometer_source?: string | null;
  distance_unit: string;
  distance_traveled?: number | null;
  distance_source?: string | null;
  volume: number;
  volume_unit: string;
  price_per_unit: number;
  total_cost: number;
  is_full_tank?: boolean | number | null;
  station?: string | null;
  notes?: string | null;
};

export type FuelMetrics = {
  distanceKm: number;
  volumeL: number;
  miPerGal: number | null;
  kmPerGal: number | null;
  miPerL: number | null;
  kmPerL: number | null;
  lPer100km: number | null;
  galPer100km: number | null;
  lPer60mi: number | null;
  galPer60mi: number | null;
  costPerKm: number | null;
  costPerMi: number | null;
  pricePerGal: number | null;
  pricePerL: number | null;
};

export type FuelEntryAnalysis = {
  entry: FuelEntryLike;
  distanceKm: number | null;
  distanceUnit: string;
  volumeL: number;
  metrics: FuelMetrics | null;
  segmentMetrics: FuelMetrics | null;
  segmentStatus: 'complete' | 'accumulating' | 'estimated';
  previousEntry?: FuelEntryLike;
};

export type FuelSegmentStatus = 'complete' | 'in_progress' | 'no_baseline';

export type FuelSegment = {
  id: number;
  status: FuelSegmentStatus;
  startEntry: FuelEntryLike;
  endEntry: FuelEntryLike;
  entries: FuelEntryAnalysis[];
  metrics: FuelMetrics | null;
};

export type FuelStats = {
  totalDistanceKm: number;
  totalVolumeL: number;
  totalSpentCents: number;
  averagePricePerL: number | null;
  averagePricePerGal: number | null;
  averageMetrics: FuelMetrics | null;
  best: FuelEntryAnalysis | null;
  worst: FuelEntryAnalysis | null;
  entries: FuelEntryAnalysis[];
};

export type ReminderStatus = {
  remainingDistance: number | null;
  remainingDays: number | null;
  status: 'ok' | 'due_soon' | 'overdue' | 'no_data';
};

export type VehicleMaintenanceLike = {
  date: number;
  odometer?: number | null;
  distance_unit: string;
  service_type: string;
  title: string;
  cost: number;
};

export type ReminderLike = {
  service_type: string;
  title: string;
  interval_distance?: number | null;
  interval_distance_unit?: string | null;
  interval_months?: number | null;
  last_service_date?: number | null;
  last_service_odometer?: number | null;
  odometer_unit?: string | null;
  next_due_date?: number | null;
  next_due_odometer?: number | null;
  is_active?: boolean | number | null;
};
