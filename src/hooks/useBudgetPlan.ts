import { useCallback, useEffect, useRef, useState } from 'react';

import {
  useBudgetPlansRepository,
  useBudgetTemplatesRepository,
} from '@/src/db';
import type { BudgetPlanView, BudgetTemplateView } from '@/src/domain/budgets/types';

export const useBudgetPlan = (groupId?: number) => {
  const repository = useBudgetPlansRepository();
  const repositoryRef = useRef(repository);
  repositoryRef.current = repository;
  const [plan, setPlan] = useState<BudgetPlanView | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!groupId) {
      setPlan(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const view = await repositoryRef.current.fetchPlanView(groupId);
      setPlan(view);
    } catch (cause) {
      setError(cause instanceof Error ? cause : new Error(String(cause)));
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { plan, loading, error, refresh, repository };
};

export const useBudgetTemplates = () => {
  const repository = useBudgetTemplatesRepository();
  const repositoryRef = useRef(repository);
  repositoryRef.current = repository;
  const [templates, setTemplates] = useState<BudgetTemplateView[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTemplates(await repositoryRef.current.listTemplates());
    } catch (cause) {
      setError(cause instanceof Error ? cause : new Error(String(cause)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { templates, loading, error, refresh, repository };
};
