import React, { useEffect } from 'react';

import { useWhatsNew } from '@/src/hooks/useWhatsNew';
import { WhatsNewModal } from './WhatsNewModal';

export const WhatsNewGate = () => {
  const initialize = useWhatsNew((state) => state.initialize);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return <WhatsNewModal />;
};
