import React, { useRef } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { useTheme } from '../theme/ThemeProvider';
import { Surface, type SurfaceVariant } from '../primitives/Surface';
import { resolveDropIndex } from './sortable';

export type SortableListHelpers = {
  moveUp: () => void;
  moveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
};

export type SortableListProps<T> = {
  items: T[];
  keyExtractor: (item: T, index: number) => string | number;
  renderItem: (
    item: T,
    dragHandle: React.ReactNode,
    index: number,
    helpers: SortableListHelpers
  ) => React.ReactNode;
  onReorder: (from: number, to: number) => void;
  /** Accessible label for the drag handle, for example `home.dashboard.dragHint`. */
  dragLabel: string;
  estimatedItemHeight?: number;
  /** Pass null to skip the surrounding Surface. Defaults to `outlined`. */
  containerVariant?: SurfaceVariant | null;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

type DraggableRowProps = {
  index: number;
  dragLabel: string;
  onDrop: (index: number, translationY: number) => void;
  onHeight: (index: number, height: number) => void;
  children: (dragHandle: React.ReactNode) => React.ReactNode;
};

const DraggableRow = ({
  index,
  dragLabel,
  onDrop,
  onHeight,
  children,
}: DraggableRowProps) => {
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
        accessibilityLabel={dragLabel}
        style={styles.dragHandle}
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

/**
 * Vertical drag-and-drop list shared by budgets and the dashboard editor.
 *
 * `renderItem` receives a drag handle and move-up/move-down helpers so every
 * screen can offer an accessible alternative to dragging.
 */
export const SortableList = <T,>({
  items,
  keyExtractor,
  renderItem,
  onReorder,
  dragLabel,
  estimatedItemHeight = 72,
  containerVariant = 'outlined',
  style,
  testID,
}: SortableListProps<T>) => {
  const heights = useRef<number[]>([]);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || to === from) return;
    onReorder(from, to);
  };

  const handleDrop = (from: number, translationY: number) => {
    const target = resolveDropIndex({
      from,
      translationY,
      heights: heights.current,
      count: items.length,
      estimatedHeight: estimatedItemHeight,
    });
    if (target !== from) onReorder(from, target);
  };

  const rows = items.map((item, index) => (
    <DraggableRow
      key={keyExtractor(item, index)}
      index={index}
      dragLabel={dragLabel}
      onDrop={handleDrop}
      onHeight={(rowIndex, height) => {
        heights.current[rowIndex] = height;
      }}
    >
      {(dragHandle) =>
        renderItem(item, dragHandle, index, {
          moveUp: () => move(index, index - 1),
          moveDown: () => move(index, index + 1),
          canMoveUp: index > 0,
          canMoveDown: index < items.length - 1,
        })
      }
    </DraggableRow>
  ));

  if (containerVariant === null) {
    return (
      <View style={style} testID={testID}>
        {rows}
      </View>
    );
  }

  return (
    <Surface variant={containerVariant} padding='none' style={style} testID={testID}>
      {rows}
    </Surface>
  );
};

const styles = StyleSheet.create({
  dragHandle: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
