/* eslint-disable import/first, @typescript-eslint/no-require-imports -- jest.mock needs to run before imports */
const mockSetPage = jest.fn();

jest.mock('react-native-pager-view', () => {
  const React = require('react');
  const { View } = require('react-native');

  function PagerView(props: any, ref: any) {
    React.useImperativeHandle(ref, () => ({ setPage: mockSetPage }));
    return <View testID="pager">{props.children}</View>;
  }

  return {
    __esModule: true,
    default: React.forwardRef(PagerView),
  };
});

jest.mock('../segmented-control/SegmentedControl', () => {
  const React = require('react');
  const { Pressable, Text, View } = require('react-native');
  return {
    __esModule: true,
    default: ({ options, onOptionPress }: any) => (
      <View>
        {options.map((o: string) => (
          <Pressable key={o} onPress={() => onOptionPress?.(o)}>
            <Text>{o}</Text>
          </Pressable>
        ))}
      </View>
    ),
  };
});

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import TopTabBar from './TabBarTop';

describe('TopTabBar', () => {
  beforeEach(() => {
    mockSetPage.mockClear();
  });

  it('syncs pager when selectedOption changes in controlled mode', () => {
    const { rerender } = render(
      <TopTabBar
        options={['All', 'Admin', 'Manager']}
        selectedOption="All"
        renderPage={() => null}
      />,
    );

    // initial effect sync
    expect(mockSetPage).toHaveBeenCalledWith(0);

    rerender(
      <TopTabBar
        options={['All', 'Admin', 'Manager']}
        selectedOption="Manager"
        renderPage={() => null}
      />,
    );

    expect(mockSetPage).toHaveBeenCalledWith(2);
  });

  it('tapping a segment moves the pager', () => {
    const onOptionChange = jest.fn();
    const ui = render(
      <TopTabBar
        options={['All', 'Admin']}
        selectedOption="All"
        onOptionChange={onOptionChange}
        renderPage={() => null}
      />,
    );

    fireEvent.press(ui.getByText('Admin'));

    expect(onOptionChange).toHaveBeenCalledWith('Admin', 1);
    expect(mockSetPage).toHaveBeenCalledWith(1);
  });
});

