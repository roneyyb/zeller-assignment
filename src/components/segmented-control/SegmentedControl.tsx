import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export type SegmentedControlOption =
  | string
  | {
      key: string;
      label: string;
      disabled?: boolean;
      testID?: string;
      accessibilityLabel?: string;
    };

type NormalizedOption = {
  key: string;
  label: string;
  disabled: boolean;
  testID?: string;
  accessibilityLabel?: string;
  index: number;
};

type TimingConfig = {
  duration?: number;
};

export interface SegmentedControlProps {
  /** Backward compatible: string[] OR richer option objects. */
  options: SegmentedControlOption[];

  /** Selected option key/label. For string options, key === label. */
  selectedOption: string;

  /** Called when a user taps an option. */
  onOptionPress?: (optionKey: string) => void;

  /** Called when selection changes (includes index). */
  onValueChange?: (optionKey: string, index: number) => void;

  /** Disable all interactions. */
  disabled?: boolean;

  /** Layout */
  height?: number;
  width?: number;
  internalPadding?: number;
  paddingVertical?: number;
  borderRadius?: number;

  /** Distribute options evenly (each takes flex: 1). */
  equalWidthOptions?: boolean;

  /** Gap between options (ignored when `equalWidthOptions` is true). */
  optionGap?: number;

  /** Colors */
  backgroundColor?: string;
  activeColor?: string;
  activeTextColor?: string;
  inactiveTextColor?: string;
  disabledTextColor?: string;

  /** Typography */
  activeTextSize?: number;
  inactiveTextSize?: number;
  fontFamily?: string;

  /** Indicator */
  showIndicator?: boolean;
  indicatorColor?: string;
  indicatorBorderColor?: string;
  indicatorBorderWidth?: number;
  indicatorBorderRadius?: number;
  indicatorStyle?: StyleProp<ViewStyle>;
  indicatorInset?: number;

  /** Animation */
  animation?: TimingConfig;

  /** Styles */
  wrapperStyle?: StyleProp<ViewStyle>;
  optionStyle?: StyleProp<ViewStyle>;
  activeOptionStyle?: StyleProp<ViewStyle>;
  inactiveOptionStyle?: StyleProp<ViewStyle>;
  disabledOptionStyle?: StyleProp<ViewStyle>;
  textStyle?: any;
  activeTextStyle?: any;
  inactiveTextStyle?: any;
  disabledTextStyle?: any;

  /** Custom label renderer */
  renderLabel?: (args: {
    optionKey: string;
    label: string;
    index: number;
    isActive: boolean;
    disabled: boolean;
  }) => React.ReactNode;

  /** Accessibility */
  accessibilityLabel?: string;
}

type OptionLayout = {
  x: number;
  width: number;
};

const SegmentedControl = ({
  options,
  selectedOption,
  onOptionPress,
  onValueChange,
  disabled = false,
  activeColor = '#14357C',
  activeTextColor = '#FFFFFF',
  inactiveTextColor = '#FFFFFF',
  disabledTextColor,
  backgroundColor = '#0A162F',
  activeTextSize = 16,
  inactiveTextSize = 16,
  fontFamily,
  height = 55,
  internalPadding = 20,
  paddingVertical = 0,
  borderRadius = 20,
  width,
  equalWidthOptions = false,
  optionGap = 0,
  wrapperStyle,
  optionStyle,
  activeOptionStyle,
  inactiveOptionStyle,
  disabledOptionStyle,
  textStyle,
  activeTextStyle,
  inactiveTextStyle,
  disabledTextStyle,
  showIndicator = true,
  indicatorColor,
  indicatorBorderColor,
  indicatorBorderWidth = 1,
  indicatorBorderRadius = 10,
  indicatorStyle,
  indicatorInset = 0,
  animation,
  renderLabel,
  accessibilityLabel,
}: SegmentedControlProps) => {
  const normalizedOptions = useMemo<NormalizedOption[]>(() => {
    return options.map((opt, index) => {
      if (typeof opt === 'string') {
        return { key: opt, label: opt, disabled: false, index };
      }
      return {
        key: opt.key,
        label: opt.label,
        disabled: !!opt.disabled,
        testID: opt.testID,
        accessibilityLabel: opt.accessibilityLabel,
        index,
      };
    });
  }, [options]);

  const optionByKey = useMemo(() => {
    const map = new Map<string, NormalizedOption>();
    for (const o of normalizedOptions) map.set(o.key, o);
    return map;
  }, [normalizedOptions]);

  const selectedKey = useMemo(() => {
    // Allow passing label as convenience (keeps old API working)
    if (optionByKey.has(selectedOption)) return selectedOption;
    const matchByLabel = normalizedOptions.find((o) => o.label === selectedOption);
    return matchByLabel?.key ?? normalizedOptions[0]?.key ?? '';
  }, [normalizedOptions, optionByKey, selectedOption]);

  const [optionLayouts, setOptionLayouts] = useState<Record<string, OptionLayout>>({});
  const [containerWidth, setContainerWidth] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const selectorX = useSharedValue(0);
  const selectorWidth = useSharedValue(0);

  useEffect(() => {
    if (!showIndicator) return;
    const selectedLayout = optionLayouts[selectedKey];
    if (!selectedLayout || containerWidth <= 0) return;

    setIsAnimating(true);
    const duration = animation?.duration ?? 300;

    selectorX.value = withTiming(
      selectedLayout.x,
      { duration },
      (finished) => finished && runOnJS(setIsAnimating)(false),
    );

    selectorWidth.value = withTiming(selectedLayout.width, { duration });
  }, [
    selectedKey,
    optionLayouts,
    containerWidth,
    showIndicator,
    animation?.duration,
    selectorWidth,
    selectorX,
  ]);

  const handleOptionPress = useCallback(
    (optionKey: string) => {
      if (disabled) return;
      if (isAnimating) return;
      const opt = optionByKey.get(optionKey);
      if (opt?.disabled) return;

      onOptionPress?.(optionKey);
      onValueChange?.(optionKey, opt?.index ?? 0);
    },
    [disabled, isAnimating, onOptionPress, onValueChange, optionByKey],
  );

  const handleOptionLayout = (optionKey: string, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setOptionLayouts((prev) => ({
      ...prev,
      [optionKey]: { x, width },
    }));
  };

  const handleContainerLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const selectorAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: selectorX.value }],
    width: selectorWidth.value,
  }));

  const resolvedIndicatorColor = indicatorColor ?? activeColor;
  const resolvedIndicatorBorderColor = indicatorBorderColor ?? activeColor;
  const resolvedDisabledTextColor = disabledTextColor ?? inactiveTextColor;

  return (
    <View
      onLayout={handleContainerLayout}
      accessibilityLabel={accessibilityLabel}
      style={[
        {
          flexDirection: 'row',
          height,
          backgroundColor,
          borderRadius,
          paddingHorizontal: internalPadding / 2,
          paddingVertical,
          width,
          position: 'relative',
          alignSelf: 'flex-start',
        },
        wrapperStyle,
      ]}
    >
      {showIndicator ? (
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: indicatorInset,
              bottom: indicatorInset,
              borderRadius: indicatorBorderRadius,
              borderWidth: indicatorBorderWidth,
              borderColor: resolvedIndicatorBorderColor,
              backgroundColor: resolvedIndicatorColor,
              shadowColor: 'black',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.1,
            },
            selectorAnimatedStyle,
            indicatorStyle,
          ]}
        />
      ) : null}

      {normalizedOptions.map((opt) => {
        const isActive = opt.key === selectedKey;
        const isOptionDisabled = disabled || opt.disabled;

        return (
          <Pressable
            key={opt.key}
            onPress={() => handleOptionPress(opt.key)}
            disabled={isOptionDisabled}
            testID={opt.testID}
            accessibilityLabel={opt.accessibilityLabel}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive, disabled: isOptionDisabled }}
            onLayout={(event) => handleOptionLayout(opt.key, event)}
            style={[
              {
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 10,
                ...(equalWidthOptions ? { flex: 1 } : null),
                ...(optionGap && !equalWidthOptions
                  ? { marginRight: opt.index === normalizedOptions.length - 1 ? 0 : optionGap }
                  : null),
              },
              optionStyle,
              isActive ? activeOptionStyle : inactiveOptionStyle,
              isOptionDisabled ? disabledOptionStyle : null,
            ]}
          >
            {renderLabel ? (
              renderLabel({
                optionKey: opt.key,
                label: opt.label,
                index: opt.index,
                isActive,
                disabled: isOptionDisabled,
              })
            ) : (
              <Text
                style={[
                  { fontSize: isActive ? activeTextSize : inactiveTextSize },
                  {
                    color: isOptionDisabled
                      ? resolvedDisabledTextColor
                      : isActive
                        ? activeTextColor
                        : inactiveTextColor,
                  },
                  fontFamily ? { fontFamily } : null,
                  textStyle,
                  isActive ? activeTextStyle : inactiveTextStyle,
                  isOptionDisabled ? disabledTextStyle : null,
                ]}
              >
                {opt.label}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
};

export default SegmentedControl;
