import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { spacing } from '../theme/tokens';
import { AppText } from '../primitives/AppText';
import { Button } from '../actions/Button';
import { Modal } from './Modal';

export type DialogTone = 'default' | 'danger';

export type DialogProps = {
  visible: boolean;
  title: string;
  message?: string;
  children?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  tone?: DialogTone;
  loading?: boolean;
  dismissOnBackdrop?: boolean;
  closeLabel?: string;
};

export const Dialog = ({
  visible,
  title,
  message,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  tone = 'default',
  loading = false,
  dismissOnBackdrop = false,
  closeLabel,
}: DialogProps) => {
  const { colors } = useTheme();

  const handleCancel = () => {
    if (onCancel) onCancel();
  };

  return (
    <Modal
      visible={visible}
      onClose={handleCancel}
      title={title}
      dismissOnBackdrop={dismissOnBackdrop}
      closeLabel={closeLabel ?? cancelLabel}
      showCloseButton={Boolean(onCancel)}
      footer={
        <View style={styles.footer}>
          {onCancel ? (
            <Button
              label={cancelLabel}
              variant='outline'
              onPress={handleCancel}
              style={styles.footerButton}
            />
          ) : null}
          <Button
            label={confirmLabel}
            variant={tone === 'danger' ? 'danger' : 'primary'}
            onPress={onConfirm}
            loading={loading}
            style={styles.footerButton}
          />
        </View>
      }
    >
      {message ? (
        <AppText style={{ color: colors.text }}>{message}</AppText>
      ) : null}
      {children}
    </Modal>
  );
};

export type ConfirmDialogProps = Omit<DialogProps, 'children'> & {
  children?: React.ReactNode;
};

export const ConfirmDialog = (props: ConfirmDialogProps) => <Dialog {...props} />;

const styles = StyleSheet.create({
  footer: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  footerButton: {
    flex: 1,
  },
});
