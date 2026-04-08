import { useAppTheme } from '@/src/utils/theme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Keyboard,
  Pressable,
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export type SearchBarExpandWithButtonProps = {
  /** Controlled input value. */
  value?: string;
  /** Controlled input change handler. */
  onChangeText: (text: string) => void;

  /** Optional callbacks. */
  onOpenChange?: (open: boolean) => void;
  onSubmit?: () => void;
  onClear?: () => void;

  /** Visuals */
  placeholder?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: TextInputProps['style'];
  buttonStyle?: StyleProp<ViewStyle>;

  /** Behavior */
  defaultOpen?: boolean;
  autoFocus?: boolean;
  closeOnBlur?: boolean;
  disabled?: boolean;

  /** Sizes */
  height?: number;
  collapsedWidth?: number; // icon-button width
  borderRadius?: number;

  /** Timing */
  durationMs?: number;

  /** Pass-through TextInput props */
  inputProps?: Omit<
    TextInputProps,
    'value' | 'onChangeText' | 'style' | 'placeholder'
  >;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * A compact search icon button that expands into a search input when tapped.
 *
 * - Tap icon -> expand + focus
 * - Tap close -> collapse + blur
 * - Optional close on blur
 */
export default function SearchBarExpandWithButton({
  value,
  onChangeText,
  onOpenChange,
  onSubmit,
  onClear,
  placeholder = 'Search',
  containerStyle,
  inputStyle,
  buttonStyle,
  defaultOpen = false,
  autoFocus = true,
  closeOnBlur = true,
  disabled = false,
  height = 40,
  collapsedWidth = 40,
  borderRadius = 12,
  durationMs = 240,
  inputProps,
}: SearchBarExpandWithButtonProps) {
  const { colors } = useAppTheme();
  const safeValue = value ?? '';
  const inputRef = useRef<TextInput>(null);

  const [containerWidth, setContainerWidth] = useState(0);
  const [open, setOpen] = useState(defaultOpen);

  const progress = useSharedValue(defaultOpen ? 1 : 0);
  const maxWidth = useMemo(() => {
    // If we don't know the width yet, fall back to collapsed.
    return containerWidth > 0 ? containerWidth : collapsedWidth;
  }, [containerWidth, collapsedWidth]);

  const setOpenState = useCallback(
    (next: boolean) => {
      setOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );

  const animateTo = useCallback(
    (nextOpen: boolean) => {
      progress.value = withTiming(nextOpen ? 1 : 0, {
        duration: durationMs,
        easing: Easing.out(Easing.cubic),
      });
    },
    [durationMs, progress],
  );

  const openSearch = useCallback(() => {
    if (disabled) return;
    setOpenState(true);
    animateTo(true);
  }, [animateTo, disabled, setOpenState]);

  const closeSearch = useCallback(() => {
    setOpenState(false);
    animateTo(false);
    Keyboard.dismiss();
  }, [animateTo, setOpenState]);

  useEffect(() => {
    // Sync initial state animation if defaultOpen is true.
    animateTo(open);
  }, [animateTo, open]);

  useEffect(() => {
    if (!open) return;
    if (!autoFocus) return;
    const id = setTimeout(() => inputRef.current?.focus(), 10);
    return () => clearTimeout(id);
  }, [autoFocus, open]);

  const handleClear = useCallback(() => {
    onClear?.();
    onChangeText('');
    // keep open and focused
    inputRef.current?.focus();
  }, [onChangeText, onClear]);

  const handleSubmitEditing = useCallback(() => {
    onSubmit?.();
  }, [onSubmit]);

  const containerAnimatedStyle = useAnimatedStyle(() => {
    const w = collapsedWidth + (maxWidth - collapsedWidth) * progress.value;
    return {
      width: w,
    };
  }, [collapsedWidth, maxWidth]);

  const inputAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0, 0.3, 1], [0, 0, 1]);
    return { opacity };
  });

  const iconAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0, 0.6, 1], [1, 0, 0]);
    const width = interpolate(
      progress.value,
      [0, 0.6, 1],
      [collapsedWidth, 0, 0],
    );
    return { opacity, width };
  });

  const closeAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0, 0.6, 1], [0, 0, 1]);
    return { opacity };
  });

  return (
    <View
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      style={[styles.host, containerStyle]}
    >
      <Animated.View
        style={[
          styles.container,
          containerAnimatedStyle,
          {
            height,
            borderRadius,
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        {/* Collapsed icon button */}
        <AnimatedPressable
          disabled={disabled}
          onPress={openSearch}
          style={[
            styles.iconButton,
            { width: collapsedWidth, height },
            iconAnimatedStyle,
            buttonStyle,
          ]}
          hitSlop={10}
        >
          <FontAwesome name="search" size={24} color={colors.text} />
        </AnimatedPressable>

        {/* Input row (only visible when expanding) */}
        <Animated.View style={[styles.inputRow, inputAnimatedStyle]}>
          <View style={styles.leadingIcon}>
            <FontAwesome name="search" size={24} color={colors.text} />
          </View>

          <TextInput
            ref={inputRef}
            value={safeValue}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            returnKeyType="search"
            onSubmitEditing={handleSubmitEditing}
            onBlur={() => {
              if (closeOnBlur) {
                // Delay slightly so pressing the clear/close buttons still works.
                progress.value = withTiming(1, { duration: 1 }, () => {
                  runOnJS(closeSearch)();
                });
              }
            }}
            style={[styles.input, { color: colors.text }, inputStyle]}
            {...inputProps}
          />

          <Pressable
            onPress={handleClear}
            disabled={disabled || safeValue.length === 0}
            hitSlop={10}
            style={({ pressed }) => [
              styles.clearButton,
              {
                opacity:
                  disabled || safeValue.length === 0
                    ? 0.35
                    : pressed
                      ? 0.65
                      : 1,
              },
            ]}
          >
            <View
              style={[
                styles.xLine,
                {
                  backgroundColor: colors.textMuted,
                  transform: [{ rotate: '45deg' }],
                },
              ]}
            />
            <View
              style={[
                styles.xLine,
                {
                  backgroundColor: colors.textMuted,
                  transform: [{ rotate: '-45deg' }],
                },
              ]}
            />
          </Pressable>

          <AnimatedPressable
            onPress={closeSearch}
            disabled={disabled}
            hitSlop={10}
            style={[styles.closeButton, closeAnimatedStyle]}
          >
            <View style={[styles.chevron, { borderColor: colors.textMuted }]} />
          </AnimatedPressable>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    width: '100%',
  },
  container: {
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  leadingIcon: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
    paddingHorizontal: 8,
  },
  clearButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 2,
  },
  xLine: {
    position: 'absolute',
    width: 14,
    height: 2,
    borderRadius: 1,
  },
  chevron: {
    width: 10,
    height: 10,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: '45deg' }],
    marginLeft: 2,
  },
  magnifier: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  magnifierHandle: {
    position: 'absolute',
    width: 8,
    height: 2,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }, { translateX: 8 }, { translateY: 8 }],
  },
  magnifierSmall: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  magnifierHandleSmall: {
    position: 'absolute',
    width: 7,
    height: 2,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }, { translateX: 7 }, { translateY: 7 }],
  },
});
