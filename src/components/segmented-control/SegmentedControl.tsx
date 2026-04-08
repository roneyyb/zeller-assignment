import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';

import Animated, {
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  type SharedValue,
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

type SegmentedOptionLabelProps = {
  label: string;
  fontSize: number;
  fontFamily?: string;
  textStyle?: any;
  activeTextStyle?: any;
  inactiveTextStyle?: any;
  disabledTextStyle?: any;
  disabled: boolean;
  isActive: boolean;
  activeTextColor: string;
  inactiveTextColor: string;
  disabledTextColor?: string;
  // Animation inputs (shared across all options)
  selectorX: SharedValue<number>;
  selectorWidth: SharedValue<number>;
  layout?: OptionLayout;
};

function SegmentedOptionLabel({
  label,
  fontSize,
  fontFamily,
  textStyle,
  activeTextStyle,
  inactiveTextStyle,
  disabledTextStyle,
  disabled,
  isActive,
  activeTextColor,
  inactiveTextColor,
  disabledTextColor,
  selectorX,
  selectorWidth,
  layout,
}: SegmentedOptionLabelProps) {
  const t = useDerivedValue(() => {
    if (!layout) return isActive ? 1 : 0;
    const optionCenter = layout.x + layout.width / 2;
    const selectorCenter = selectorX.value + selectorWidth.value / 2;
    const d = Math.abs(selectorCenter - optionCenter);
    const half = Math.max(1, layout.width / 2);
    const v = 1 - d / half;
    return Math.max(0, Math.min(1, v));
  }, [isActive, layout, selectorWidth, selectorX]);

  const animatedTextStyle = useAnimatedStyle(() => {
    if (disabled) {
      return {
        color: disabledTextColor ?? inactiveTextColor,
      };
    }

    return {
      color: interpolateColor(t.value, [0, 1], [inactiveTextColor, activeTextColor]),
    };
  }, [activeTextColor, disabled, disabledTextColor, inactiveTextColor, t]);

  return (
    <Animated.Text
      style={[
        { fontSize },
        fontFamily ? { fontFamily } : null,
        textStyle,
        isActive ? activeTextStyle : inactiveTextStyle,
        disabled ? disabledTextStyle : null,
        animatedTextStyle,
      ]}
    >
      {label + ' '}
    </Animated.Text>
  );
}

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
    const matchByLabel = normalizedOptions.find(
      (o) => o.label === selectedOption,
    );
    return matchByLabel?.key ?? normalizedOptions[0]?.key ?? '';
  }, [normalizedOptions, optionByKey, selectedOption]);

  const [optionLayouts, setOptionLayouts] = useState<
    Record<string, OptionLayout>
  >({});
  const [isAnimating, setIsAnimating] = useState(false);

  const selectorX = useSharedValue(0);
  const selectorWidth = useSharedValue(0);

  useEffect(() => {
    if (!showIndicator) return;
    const selectedLayout = optionLayouts[selectedKey];
    if (!selectedLayout) return;

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

  const selectorAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: selectorX.value }],
    width: selectorWidth.value,
  }));

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          height,
          backgroundColor,
          borderRadius,
          // paddingHorizontal: internalPadding / 2,
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
              borderColor: indicatorBorderColor,
              backgroundColor: indicatorColor,
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
        const layout = optionLayouts[opt.key];

        return (
          <Pressable
            key={opt.key}
            onPress={() => handleOptionPress(opt.key)}
            disabled={isOptionDisabled}
            testID={opt.testID}
            accessibilityLabel={opt.accessibilityLabel}
            accessibilityRole="button"
            accessibilityState={{
              selected: isActive,
              disabled: isOptionDisabled,
            }}
            onLayout={(event) => handleOptionLayout(opt.key, event)}
            style={[
              {
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 10,
                ...(equalWidthOptions ? { flex: 1 } : null),
                ...(optionGap && !equalWidthOptions
                  ? {
                      marginRight:
                        opt.index === normalizedOptions.length - 1
                          ? 0
                          : optionGap,
                    }
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
              <SegmentedOptionLabel
                label={opt.label}
                fontSize={isActive ? activeTextSize : inactiveTextSize}
                fontFamily={fontFamily}
                textStyle={textStyle}
                activeTextStyle={activeTextStyle}
                inactiveTextStyle={inactiveTextStyle}
                disabledTextStyle={disabledTextStyle}
                disabled={isOptionDisabled}
                isActive={isActive}
                activeTextColor={activeTextColor}
                inactiveTextColor={inactiveTextColor}
                disabledTextColor={disabledTextColor}
                selectorX={selectorX}
                selectorWidth={selectorWidth}
                layout={layout}
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );
};

export default SegmentedControl;
