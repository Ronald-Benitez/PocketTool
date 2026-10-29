import { useEffect, useState } from 'react';

import { useGroups } from '@/src/db';
import { buildRecordFilterFields } from '@/src/domain/records/filterFields';
import type { Group } from '@/src/interfaces/schema';
import { useLanguage } from '@/src/lang/LanguageContext';
import { useDataStore } from '@/src/stores';

/**
 * Construye los campos de filtro de Records con opciones legibles para las
 * relaciones. Las opciones salen de los stores ya cargados y de `useGroups`
 * para no depender del año seleccionado en la tabla.
 */
export const useRecordFilterFields = () => {
  const { t, getMonths } = useLanguage();
  const { RecordTypes, Categories, PaymentMethods, Fixeds } = useDataStore();
  const { fetchGroups } = useGroups();
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    let mounted = true;
    fetchGroups()
      .then((rows) => {
        if (mounted) setGroups(rows ?? []);
      })
      .catch((error) => {
        console.error('No se pudieron cargar los grupos para los filtros:', error);
      });

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return buildRecordFilterFields({
    t,
    recordTypes: RecordTypes ?? [],
    categories: Categories ?? [],
    paymentMethods: PaymentMethods ?? [],
    fixeds: Fixeds ?? [],
    groups,
    months: getMonths() as string[],
  });
};
