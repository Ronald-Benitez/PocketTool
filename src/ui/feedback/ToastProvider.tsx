import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useTheme } from '../theme/ThemeProvider';
import { radii, shadows, spacing, zIndex } from '../theme/tokens';
import { AppText } from '../primitives/AppText';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export type ToastOptions = {
  message: string;
  title?: string;
  type?: ToastVariant;
  duration?: number;
};

export type ToastState = {
  message: string;
  title?: string;
  type: ToastVariant;
  duration: number;
};

type ToastContextValue = {
  toast: ToastState | null;
  showToast: (options: ToastOptions) => void;
  hideToast: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 3000;

const VARIANT_KEYS: Record<
  ToastVariant,
  {
    background: 'toastSuccessBg' | 'toastErrorBg' | 'toastWarningBg' | 'toastInfoBg';
    text: 'toastSuccessText' | 'toastErrorText' | 'toastWarningText' | 'toastInfoText';
    icon: 'check-circle' | 'error' | 'warning' | 'info';
  }
> = {
  success: {
    background: 'toastSuccessBg',
    text: 'toastSuccessText',
    icon: 'check-circle',
  },
  error: {
    background: 'toastErrorBg',
    text: 'toastErrorText',
    icon: 'error',
  },
  warning: {
    background: 'toastWarningBg',
    text: 'toastWarningText',
    icon: 'warning',
  },
  info: {
    background: 'toastInfoBg',
    text: 'toastInfoText',
    icon: 'info',
  },
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const hideToast = useCallback(() => {
    clearTimer();
    setToast(null);
  }, [clearTimer]);

  const showToast = useCallback(
    (options: ToastOptions) => {
      clearTimer();
      const next: ToastState = {
        message: options.message,
        title: options.title,
        type: options.type ?? 'info',
        duration: options.duration ?? DEFAULT_DURATION,
      };
      setToast(next);

      timeoutRef.current = setTimeout(() => {
        setToast(null);
        timeoutRef.current = null;
      }, next.duration);
    },
    [clearTimer]
  );

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const value = useMemo<ToastContextValue>(
    () => ({ toast, showToast, hideToast }),
    [toast, showToast, hideToast]
  );

  return (
    <ToastContext.Provider value={value}>
      <View style={styles.root}>
        {children}
        <ToastViewport />
      </View>
    </ToastContext.Provider>
  );
};

/**
 * Host visual del toast. Se puede montar dentro de un `Modal` para que el
 * aviso quede visible por encima del overlay.
 */
export const ToastViewport = () => {
  const context = useContext(ToastContext);
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!context?.toast) return;
    opacity.setValue(0);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [context?.toast, opacity]);

  if (!context?.toast) return null;

  const { toast, hideToast } = context;
  const keys = VARIANT_KEYS[toast.type];
  const backgroundColor = colors[keys.background];
  const textColor = colors[keys.text];

  return (
    <View pointerEvents='box-none' style={styles.host}>
      <Pressable
        onPress={hideToast}
        accessibilityRole='alert'
        accessibilityLiveRegion='polite'
        style={{ width: '100%', alignItems: 'center' }}
      >
        <Animated.View
          style={[
            styles.card,
            shadows.floating,
            {
              backgroundColor,
              borderColor: textColor,
              shadowColor: colors.shadow,
              opacity,
              transform: [
                {
                  translateY: opacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [12, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <MaterialIcons name={keys.icon} size={22} color={textColor} />
          <View style={styles.textBlock}>
            {toast.title ? (
              <AppText variant='label' style={{ color: textColor }}>
                {toast.title}
              </AppText>
            ) : null}
            <AppText variant='body' style={{ color: textColor }}>
              {toast.message}
            </AppText>
          </View>
        </Animated.View>
      </Pressable>
    </View>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe usarse dentro de ToastProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  host: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.md,
    zIndex: zIndex.toast,
    elevation: zIndex.toast,
    alignItems: 'center',
  },
  card: {
    maxWidth: 480,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  textBlock: {
    flex: 1,
    gap: spacing.xxs,
  },
});
