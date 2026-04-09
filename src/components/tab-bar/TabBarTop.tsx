import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import PagerView, {
  PagerViewOnPageSelectedEvent,
} from 'react-native-pager-view';

import SegmentedControl, {
  SegmentedControlProps,
} from '../segmented-control/SegmentedControl';

type RenderPage = (option: string, index: number) => React.ReactNode;

export type TopTabBarProps = {
  /** Tab labels in pager order. Must be stable across renders. */
  options: string[];

  /**
   * Controlled selected option (recommended when you also store current tab in state/store).
   * If omitted, component is uncontrolled and uses `defaultOption`.
   */
  selectedOption?: string;

  /** Initial option in uncontrolled mode. Defaults to first entry in `options`. */
  defaultOption?: string;

  /** Fired when user taps a segment or swipes pages. */
  onOptionChange?: (option: string, index: number) => void;

  /** Renders the page content for each option. */
  renderPage: RenderPage;

  /** Container styles. */
  containerStyle?: StyleProp<ViewStyle>;

  /** Optional right-side content next to the segmented control (e.g. search icon). */
  headerRight?: React.ReactNode;

  /** Hide the segmented control (left header) while keeping pager. */
  hideHeaderLeft?: boolean;

  /** Segmented control styling passthrough. */
  segmented?: Partial<SegmentedControlProps>;

  /** Pager props. */
  pagerStyle?: StyleProp<ViewStyle>;
  scrollEnabled?: boolean;

  /** Header styles. */
  headerHeight?: number;
};

/**
 * Top segmented tabs + swipeable pager.
 *
 * - Tap on a tab -> animates selector + scrolls pager
 * - Swipe pager -> updates selected tab
 */
export default function TopTabBar({
  options,
  selectedOption: selectedOptionProp,
  defaultOption,
  onOptionChange,
  renderPage,
  containerStyle,
  headerRight,
  hideHeaderLeft = false,
  segmented,
  pagerStyle,
  scrollEnabled = true,
  headerHeight = 50,
}: TopTabBarProps) {
  const pagerRef = useRef<PagerView>(null);

  const fallbackDefault = useMemo(() => options[0] ?? '', [options]);
  const uncontrolledDefault = defaultOption ?? fallbackDefault;

  const isControlled = selectedOptionProp != null;
  const [uncontrolledOption, setUncontrolledOption] =
    useState(uncontrolledDefault);

  const selectedOption = isControlled
    ? (selectedOptionProp as string)
    : uncontrolledOption;

  const selectedIndex = useMemo(() => {
    const idx = options.indexOf(selectedOption);
    return idx >= 0 ? idx : 0;
  }, [options, selectedOption]);

  useEffect(() => {
    // When controlled, the parent may change `selectedOption` programmatically
    // (e.g. forcing "All" when search opens). Keep the pager in sync.
    if (!isControlled) return;
    pagerRef.current?.setPage(selectedIndex);
  }, [isControlled, selectedIndex]);

  const setSelected = useCallback(
    (nextOption: string, nextIndex: number, source: 'tap' | 'swipe') => {
      if (!isControlled) setUncontrolledOption(nextOption);
      onOptionChange?.(nextOption, nextIndex);

      // Only imperatively move the pager when the source is a tap.
      // On swipe, the pager is already at the right index.
      if (source === 'tap') {
        pagerRef.current?.setPage(nextIndex);
      }
    },
    [isControlled, onOptionChange],
  );

  const handleOptionPress = useCallback(
    (option: string) => {
      const idx = options.indexOf(option);
      setSelected(option, idx >= 0 ? idx : 0, 'tap');
    },
    [options, setSelected],
  );

  const handlePageSelected = useCallback(
    (e: PagerViewOnPageSelectedEvent) => {
      const idx = e.nativeEvent.position;
      const option = options[idx] ?? options[0] ?? '';
      if (!option) return;
      setSelected(option, idx, 'swipe');
    },
    [options, setSelected],
  );

  return (
    <View style={[{ flex: 1 }, containerStyle]}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          height: headerHeight,
        }}
      >
        <View style={{ flex: 0.6, opacity: hideHeaderLeft ? 0 : 1 }}>
          <SegmentedControl
            options={options}
            selectedOption={options[selectedIndex] ?? selectedOption}
            onOptionPress={handleOptionPress}
            {...segmented}
          />
        </View>

        <View
          style={{
            position: 'absolute',
            right: 16,
            left: 16,
            top: 0,
            bottom: 0,
          }}
        >
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'flex-end',
            }}
          >
            {headerRight}
          </View>
        </View>
      </View>
      <PagerView
        ref={pagerRef}
        style={[pagerStyle, { flex: 1 }]}
        initialPage={selectedIndex}
        onPageSelected={handlePageSelected}
        scrollEnabled={scrollEnabled}
      >
        {options.map((option, index) => (
          <View key={option} style={{ flex: 1 }}>
            {renderPage(option, index)}
          </View>
        ))}
      </PagerView>
    </View>
  );
}
