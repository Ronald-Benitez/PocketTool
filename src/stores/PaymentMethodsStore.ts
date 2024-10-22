import { create } from "zustand";
import { PaymentMethod } from "../interfaces";

interface PaymentSate {
  payments: PaymentMethod[] | null;
  setPayments: (payments: PaymentMethod[]) => void;
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
