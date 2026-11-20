import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { useConfigs } from '@/src/hooks/useConfigs';
import { useCreateCurrentGroup } from '@/src/hooks/useCreateCurrentGroup';

/**
 * Creates the group for the current period when the app starts or returns to
 * the foreground. The repository guards against duplicates, respects deleted
 * groups and only creates the period that contains today.
 */
export const useAutoGroup = () => {
  const { loadConfigs } = useConfigs();
  const { createCurrentGroup } = useCreateCurrentGroup();
  const running = useRef(false);
  const loadRef = useRef(loadConfigs);
  const createRef = useRef(createCurrentGroup);
  loadRef.current = loadConfigs;
  createRef.current = createCurrentGroup;

  useEffect(() => {
    const run = async () => {
      if (running.current) return;
      running.current = true;
      try {
        await loadRef.current();
        if (!useConfigs.getState().configs.groupAutoCreate) return;
        await createRef.current({ automatic: true });
      } finally {
        running.current = false;
      }
    };

    void run();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void run();
    });

    return () => subscription.remove();
  }, []);
};

export default useAutoGroup;
