import React, { useState } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useLanguage } from '@/src/lang/LanguageContext';
import { useTheme } from '../theme/ThemeProvider';
import { IconButton } from '../actions/IconButton';
import { AppText } from '../primitives/AppText';
import { Modal } from './Modal';

export type InfoHintContent = {
  title: string;
  body: string;
};

export type InfoHintProps = {
  title: string;
  body: string;
  /** Accessible label for the trigger. Defaults to `common.moreInfo`. */
  label?: string;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Optional explanation trigger. Opens a bottom sheet with a title and body.
 *
 * Use it for educational copy, concepts and examples. Never hide errors,
 * warnings, validations or information required to finish a form.
 */
export const InfoHint = ({
  title,
  body,
  label,
  size = 'sm',
  icon,
  style,
}: InfoHintProps) => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);

  return (
    <>
      <IconButton
        label={label ?? t('moreInfo')}
        size={size}
        variant='ghost'
        hitSlop={size === 'sm' ? 6 : 0}
        icon={
          icon ?? (
            <MaterialIcons
              name='info-outline'
              size={size === 'sm' ? 20 : 22}
              color={colors.textMuted}
            />
          )
        }
        onPress={() => setVisible(true)}
        style={style}
      />
      <Modal
        visible={visible}
        onClose={() => setVisible(false)}
        title={title}
        placement='bottom'
        closeLabel={t('close')}
      >
        <AppText>{body}</AppText>
      </Modal>
    </>
  );
};
