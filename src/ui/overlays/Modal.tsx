import React from 'react';
import {
  Modal as RNModal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeProvider';
import { radii, shadows, spacing } from '../theme/tokens';
import { AppText } from '../primitives/AppText';
import { IconButton } from '../actions/IconButton';

export type ModalPlacement = 'center' | 'bottom';

export type ModalProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  footer?: React.ReactNode;
  placement?: ModalPlacement;
  dismissOnBackdrop?: boolean;
  showCloseButton?: boolean;
  scrollable?: boolean;
  maxWidth?: number;
  contentStyle?: StyleProp<ViewStyle>;
  closeLabel?: string;
};

export const Modal = ({
  visible,
  onClose,
  children,
  title,
  footer,
  placement = 'center',
  dismissOnBackdrop = true,
  showCloseButton = true,
  scrollable = false,
  maxWidth = 460,
  contentStyle,
  closeLabel = 'Close',
}: ModalProps) => {
  const { colors } = useTheme();
  const isBottom = placement === 'bottom';

  const body = scrollable ? (
    <ScrollView
      keyboardShouldPersistTaps='handled'
      style={styles.body}
      contentContainerStyle={[styles.bodyContent, contentStyle]}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.bodyContent, contentStyle]}>{children}</View>
  );

  return (
    <RNModal
      visible={visible}
      onRequestClose={onClose}
      transparent
      animationType={isBottom ? 'slide' : 'fade'}
      statusBarTranslucent
    >
      <Pressable
        onPress={dismissOnBackdrop ? onClose : undefined}
        style={[
          styles.backdrop,
          {
            backgroundColor: colors.overlay,
            justifyContent: isBottom ? 'flex-end' : 'center',
          },
        ]}
      >
        <Pressable
          onPress={() => {}}
          accessibilityViewIsModal
          onAccessibilityEscape={onClose}
          style={[
            styles.card,
            shadows.floating,
            {
              backgroundColor: colors.surface,
              shadowColor: colors.shadow,
              borderTopLeftRadius: isBottom ? radii.xl : radii.lg,
              borderTopRightRadius: isBottom ? radii.xl : radii.lg,
              borderBottomLeftRadius: isBottom ? 0 : radii.lg,
              borderBottomRightRadius: isBottom ? 0 : radii.lg,
              maxWidth: isBottom ? undefined : maxWidth,
              width: isBottom ? '100%' : '92%',
              maxHeight: isBottom ? '88%' : '85%',
            },
          ]}
        >
          {isBottom ? (
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
          ) : null}

          {title || showCloseButton ? (
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <AppText variant='subtitle' style={styles.headerTitle} numberOfLines={2}>
                {title ?? ''}
              </AppText>
              {showCloseButton ? (
                <IconButton
                  label={closeLabel}
                  size='sm'
                  variant='ghost'
                  icon={<MaterialIcons name='close' size={22} color={colors.textMuted} />}
                  onPress={onClose}
                />
              ) : null}
            </View>
          ) : null}

          {body}

          {footer ? (
            <View style={[styles.footer, { borderTopColor: colors.border }]}>{footer}</View>
          ) : null}
        </Pressable>
      </Pressable>
    </RNModal>
  );
};

export const BottomSheet = (props: Omit<ModalProps, 'placement'>) => (
  <Modal {...props} placement='bottom' />
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    padding: spacing.md,
  },
  card: {
    alignSelf: 'center',
    overflow: 'hidden',
    borderRadius: radii.lg,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: radii.pill,
    alignSelf: 'center',
    marginTop: spacing.sm,
  },
  header: {
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    flex: 1,
  },
  bodyContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  body: {
    flexShrink: 1,
  },
  footer: {
    borderTopWidth: 1,
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
});
