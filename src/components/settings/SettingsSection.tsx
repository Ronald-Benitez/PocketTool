import React, { useEffect, useState } from 'react';

import { SectionCard } from '@/src/ui/data-display/SectionCard';

type SettingsSectionProps = {
  title: string;
  description?: string;
  keywords?: string[];
  search?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

/**
 * Searchable settings group.
 *
 * The description is optional explanation, so it lives in a tooltip instead of
 * stretching the section header. Search still indexes it.
 */
export const SettingsSection = ({
  title,
  description,
  keywords = [],
  search = '',
  defaultOpen = false,
  children,
}: SettingsSectionProps) => {
  const [open, setOpen] = useState(defaultOpen);
  const normalizedSearch = search.trim().toLowerCase();
  const matches =
    !normalizedSearch ||
    [title, description ?? '', ...keywords].some((value) =>
      value.toLowerCase().includes(normalizedSearch)
    );

  useEffect(() => {
    if (normalizedSearch) setOpen(true);
  }, [normalizedSearch]);

  if (!matches) return null;

  return (
    <SectionCard
      title={title}
      tooltip={description ? { title, body: description } : undefined}
      collapsible
      collapsed={!open}
      onToggle={(collapsed) => setOpen(!collapsed)}
    >
      {children}
    </SectionCard>
  );
};
