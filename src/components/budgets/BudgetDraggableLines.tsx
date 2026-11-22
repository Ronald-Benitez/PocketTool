import React, { useRef } from 'react';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import type { BudgetLineComparison } from '@/src/domain/budgets/types';
import { useLanguage } from '@/src/lang/LanguageContext';
import { Surface } from '@/src/ui/primitives/Surface';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

type BudgetDraggableLinesProps = {
  lines: BudgetLineComparison[];
  onReorder: (from: number, to: number) => void;
  renderLine: (
    line: BudgetLineComparison,
    dragHandle: React.ReactNode,
    index: number
  ) => React.ReactNode;
};

type DraggableRowProps = {
  index: number;
  onDrop: (index: number, translationY: number) => void;
  onHeight: (index: number, height: number) => void;
  children: (dragHandle: React.ReactNode) => React.ReactNode;
};

const DraggableRow = ({
  index,
  onDrop,
  onHeight,
  children,
}: DraggableRowProps) => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const translationY = useSharedValue(0);
  const dragging = useSharedValue(false);

  const gesture = Gesture.Pan()
    .activateAfterLongPress(150)
    .onStart(() => {
      dragging.value = true;
    })
    .onUpdate((event) => {
      translationY.value = event.translationY;
    })
    .onEnd((event) => {
      runOnJS(onDrop)(index, event.translationY);
      translationY.value = 0;
      dragging.value = false;
    })
    .onFinalize(() => {
      translationY.value = 0;
      dragging.value = false;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: dragging.value ? translationY.value : 0 }],
    zIndex: dragging.value ? 20 : 0,
    opacity: dragging.value ? 0.95 : 1,
  }));

  const dragHandle = (
    <GestureDetector gesture={gesture}>
      <View
        accessible
        accessibilityRole='button'
        accessibilityLabel={t('budget.lines.reorder')}
        style={{
          width: 44,
          height: 44,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MaterialIcons name='drag-handle' size={22} color={colors.textMuted} />
      </View>
    </GestureDetector>
  );

  return (
    <Animated.View
      onLayout={(event) => onHeight(index, event.nativeEvent.layout.height)}
      style={animatedStyle}
    >
      {children(dragHandle)}
    </Animated.View>
  );
};

export const BudgetDraggableLines = ({
  lines,
  onReorder,
  renderLine,
}: BudgetDraggableLinesProps) => {
  const heights = useRef<number[]>([]);

  const handleDrop = (from: number, translationY: number) => {
    if (translationY === 0) return;

    let target = from;
    if (translationY > 0) {
      let offset = translationY;
      for (let index = from + 1; index < lines.length; index += 1) {
        const height = heights.current[index] ?? 72;
        if (offset <= height / 2) break;
        offset -= height;
        target = index;
      }
    } else {
      let offset = -translationY;
      for (let index = from - 1; index >= 0; index -= 1) {
        const height = heights.current[index] ?? 72;
        if (offset <= height / 2) break;
        offset -= height;
        target = index;
      }
    }

    if (target !== from) onReorder(from, target);
  };

  return (
    <Surface variant='outlined' padding='none'>
      {lines.map((line, index) => (
        <DraggableRow
          key={line.lineId}
          index={index}
          onDrop={handleDrop}
          onHeight={(rowIndex, height) => {
            heights.current[rowIndex] = height;
          }}
        >
          {(dragHandle) => renderLine(line, dragHandle, index)}
        </DraggableRow>
      ))}
    </Surface>
  );
};
