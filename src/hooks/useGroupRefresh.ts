import { useCallback, useRef } from 'react';

import {
  usePaidCredits,
  usePersonSettlementsRepository,
  useRecords,
} from '@/src/db';
import useRecordsStore from '@/src/stores/RecordsStore';

/**
 * Reloads the group-scoped data shared by Home, Records, Summaries and People.
 * Use it after any flow that creates or edits Records outside the Records
 * screen, such as fuel, maintenance or savings.
 */
export const useGroupRefresh = () => {
  const recordsRepository = useRecords();
  const creditsRepository = usePaidCredits();
  const settlementsRepository = usePersonSettlementsRepository();
  const recordsRef = useRef(recordsRepository);
  const creditsRef = useRef(creditsRepository);
  const settlementsRef = useRef(settlementsRepository);
  recordsRef.current = recordsRepository;
  creditsRef.current = creditsRepository;
  settlementsRef.current = settlementsRepository;

  const { setRecords, setPaidCredits, setSettlements } = useRecordsStore();

  const refreshGroupData = useCallback(
    async (groupId?: number | null) => {
      if (!groupId) return;
      const [records, credits, settlements] = await Promise.all([
        recordsRef.current.fetchRecords(groupId),
        creditsRef.current.fetchByGroup(groupId),
        settlementsRef.current.fetchByGroup(groupId),
      ]);
      setRecords(records ?? []);
      setPaidCredits(credits);
      setSettlements(settlements);
    },
    [setPaidCredits, setRecords, setSettlements]
  );

  return { refreshGroupData };
};
