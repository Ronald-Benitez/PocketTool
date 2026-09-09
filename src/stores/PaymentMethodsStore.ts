import { create } from "zustand";
import { PaymentMethodWithRelations } from "../interfaces/schema";

interface PaymentSate {
  payments: PaymentMethodWithRelations[] | null;
  setPayments: (payments: PaymentMethodWithRelations[]) => void;
}

const usePaymentsStore = create<PaymentSate>()((set) => ({
  payments: null,
  setPayments: async (payments) => {
    set(() => ({
      payments,
    }));
  },
}));

export default usePaymentsStore;
