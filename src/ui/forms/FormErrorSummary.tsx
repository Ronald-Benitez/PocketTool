import React from 'react';

import { useLanguage } from '@/src/lang/LanguageContext';
import { InlineMessage } from '../feedback/InlineMessage';
import { AppText } from '../primitives/AppText';
import { Stack } from '../primitives/Stack';

export type FormErrorSummaryProps = {
  /** Labels of the missing or invalid fields. */
  errors: string[];
  title?: string;
};

/**
 * Error banner shown at the top of a modal body.
 *
 * Pair it with a red `error` on each affected field; the summary tells the user
 * what is missing and the field marks where to fix it.
 */
export const FormErrorSummary = ({ errors, title }: FormErrorSummaryProps) => {
  const { t } = useLanguage();
  if (errors.length === 0) return null;

  return (
    <InlineMessage
      variant='error'
      title={title ?? t('formErrorTitle')}
    >
      <Stack gap='xxs'>
        {errors.map((error, index) => (
          <AppText key={`${error}-${index}`} variant='body'>
            • {error}
          </AppText>
        ))}
      </Stack>
    </InlineMessage>
  );
};
