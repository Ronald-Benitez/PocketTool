import React, { createContext, useContext } from 'react';

export type DashboardRefreshValue = {
  refreshKey: number;
  refresh: () => void;
};

const FALLBACK: DashboardRefreshValue = {
  refreshKey: 0,
  refresh: () => {},
};

const DashboardRefreshContext =
  createContext<DashboardRefreshValue>(FALLBACK);

export const DashboardRefreshProvider = ({
  value,
  children,
}: {
  value: DashboardRefreshValue;
  children: React.ReactNode;
}) => (
  <DashboardRefreshContext.Provider value={value}>
    {children}
  </DashboardRefreshContext.Provider>
);

export const useDashboardRefresh = () =>
  useContext(DashboardRefreshContext);
