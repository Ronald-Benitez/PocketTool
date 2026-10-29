import { View, type ViewStyle, type StyleProp } from 'react-native';
import React, { useState } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';

import { useLanguage } from '@/src/lang/LanguageContext';
import { useTheme } from '../theme/ThemeProvider';
import { Dialog } from '../overlays/Dialog';

export interface SwipeActionProps {
  children: React.ReactNode;
  handleDelete: () => void;
  handleUpdate?: () => void;
  deleteContent?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const SwipeAction = ({
  children,
  handleDelete,
  handleUpdate,
  deleteContent,
  style,
}: SwipeActionProps) => {
  const translationX = useSharedValue(0);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const { t } = useLanguage();
  const { colors } = useTheme();

  const showDeleteDialog = () => setConfirmVisible(true);

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      const value = event.translationX;
      if (value > -150 && value < 150) {
        translationX.value = value;
      }
    })
    .onEnd((event) => {
      if (event.translationX < -90) {
        runOnJS(showDeleteDialog)();
      }
      if (event.translationX > 90 && handleUpdate) {
        runOnJS(handleUpdate)();
      }
      translationX.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translationX.value }],
  }));

  const animatedOpacity = useAnimatedStyle(() => ({
    opacity: translationX.value < -60 ? 1 : 0 || translationX.value > 60 ? 1 : 0,
  }));

  const onConfirmDelete = () => {
    handleDelete();
    setConfirmVisible(false);
  };

  return (
    <View style={style}>
      <GestureDetector gesture={pan}>
        <Animated.View style={animatedStyle}>
          {children}
        </Animated.View>
      </GestureDetector>

      <Animated.View
        pointerEvents='none'
        style={[
          styles.action,
          styles.actionRight,
          { backgroundColor: colors.danger },
          animatedOpacity,
        ]}
      >
        <MaterialIcons name='delete-outline' size={24} color={colors.onDanger} />
      </Animated.View>

      {handleUpdate ? (
        <Animated.View
          pointerEvents='none'
          style={[
            styles.action,
            styles.actionLeft,
            { backgroundColor: colors.warning },
            animatedOpacity,
          ]}
        >
          <MaterialIcons name='edit' size={22} color={colors.onWarning} />
        </Animated.View>
      ) : null}

      <Dialog
        visible={confirmVisible}
        title={t('delete')}
        message={deleteContent ? undefined : t('confirmDelete')}
        confirmLabel={t('confirm')}
        cancelLabel={t('cancel')}
        closeLabel={t('cancel')}
        tone='danger'
        onConfirm={onConfirmDelete}
        onCancel={() => setConfirmVisible(false)}
      >
        {deleteContent}
      </Dialog>
    </View>
  );
};

const styles = {
  action: {
    position: 'absolute',
    width: 52,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    top: 8,
  } as ViewStyle,
  actionRight: {
    right: 0,
  } as ViewStyle,
  actionLeft: {
    left: 0,
  } as ViewStyle,
};
