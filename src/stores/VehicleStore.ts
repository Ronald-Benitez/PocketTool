import { create } from 'zustand';

interface VehicleSelectionState {
  selectedVehicleId: number | null;
  setSelectedVehicleId: (id: number | null) => void;
}

export const useVehicleStore = create<VehicleSelectionState>((set) => ({
  selectedVehicleId: null,
  setSelectedVehicleId: (id) => set({ selectedVehicleId: id }),
}));
