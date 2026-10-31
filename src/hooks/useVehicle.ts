import { useCallback, useEffect, useRef, useState } from 'react';

import { useVehiclesRepository } from '@/src/db';
import type { Vehicle } from '@/src/interfaces/schema';
import { useVehicleStore } from '@/src/stores/VehicleStore';

export const useVehicle = () => {
  const repository = useVehiclesRepository();
  const repositoryRef = useRef(repository);
  repositoryRef.current = repository;
  const { selectedVehicleId, setSelectedVehicleId } = useVehicleStore();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setVehicles(await repositoryRef.current.fetchVehicles());
    } catch (cause) {
      setError(cause instanceof Error ? cause : new Error(String(cause)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (vehicles.length === 0) return;
    const selected = vehicles.find((item) => item.id === selectedVehicleId);
    if (selected) return;
    const fallback =
      vehicles.find((item) => Boolean(item.is_default)) ?? vehicles[0];
    setSelectedVehicleId(fallback?.id ?? null);
  }, [vehicles, selectedVehicleId, setSelectedVehicleId]);

  const vehicle =
    vehicles.find((item) => item.id === selectedVehicleId) ?? null;

  return {
    vehicles,
    vehicle,
    selectedVehicleId,
    selectVehicle: setSelectedVehicleId,
    loading,
    error,
    refresh,
    repository,
  };
};
