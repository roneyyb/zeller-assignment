/* eslint-disable import/first, @typescript-eslint/no-require-imports -- mocks must be defined before imports */
let mockNavigate = jest.fn();
let latestFocusCallback: (() => void | (() => void)) | undefined;
let mockDidRunInitialFocus = false;

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
  useFocusEffect: (cb: () => void | (() => void)) => {
    latestFocusCallback = cb;
    if (!mockDidRunInitialFocus) {
      mockDidRunInitialFocus = true;
      cb();
    }
  },
}));

jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: () => null,
}));

jest.mock('@/src/components/tab-bar/TabBarTop', () => {
  const React = require('react');
  const { Pressable, Text, View } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => (
      <View>
        <Text testID="selected-option">{props.selectedOption}</Text>
        <Text testID="hide-header-left">{String(!!props.hideHeaderLeft)}</Text>
        {props.options.map((opt: string, index: number) => (
          <Pressable
            key={opt}
            testID={`tab-${opt}`}
            onPress={() => props.onOptionChange?.(opt, index)}
          >
            <Text>{opt}</Text>
          </Pressable>
        ))}
        {props.headerRight}
        <View testID="rendered-page">
          {props.renderPage(props.selectedOption ?? props.options[0], 0)}
        </View>
      </View>
    ),
  };
});

jest.mock('@/src/features/Search', () => {
  const React = require('react');
  const { Pressable, Text, View } = require('react-native');
  return {
    __esModule: true,
    Search: (props: any) => (
      <View>
        <Text testID="search-value">{props.value}</Text>
        <Pressable testID="search-open" onPress={() => props.onOpenChange?.(true)}>
          <Text>open</Text>
        </Pressable>
        <Pressable testID="search-close" onPress={() => props.onOpenChange?.(false)}>
          <Text>close</Text>
        </Pressable>
        <Pressable testID="search-change" onPress={() => props.onChangeText?.('Ada')}>
          <Text>change</Text>
        </Pressable>
      </View>
    ),
  };
});

jest.mock('@/src/features/UsersList', () => {
  const React = require('react');
  const { Pressable, Text, View } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) => (
      <View>
        <Text testID={`users-list-role-${props.role || 'all'}`}>{props.search}</Text>
        <Text testID={`users-list-reload-${props.role || 'all'}`}>{String(props.reloadKey ?? 0)}</Text>
        <Pressable
          testID={`users-list-press-${props.role || 'all'}`}
          onPress={() => props.onUserPress?.('user_1')}
        >
          <Text>press-user</Text>
        </Pressable>
      </View>
    ),
  };
});

import React from 'react';
import { act, fireEvent, screen } from '@testing-library/react-native';

import { renderWithProviders } from '@/src/test/renderWithProviders';

import UsersHomeScreen from './UsersHomeScreen';

describe('UsersHomeScreen', () => {
  beforeEach(() => {
    mockNavigate = jest.fn();
    latestFocusCallback = undefined;
    mockDidRunInitialFocus = false;
  });

  it('navigates to create screen from FAB', () => {
    renderWithProviders(<UsersHomeScreen />);

    fireEvent.press(screen.getByLabelText('Add user'));
    expect(mockNavigate).toHaveBeenCalledWith('CreateUser');
  });

  it('navigates to edit screen when a user row is pressed', () => {
    renderWithProviders(<UsersHomeScreen />);

    fireEvent.press(screen.getByTestId('users-list-press-all'));
    expect(mockNavigate).toHaveBeenCalledWith('EditUser', { id: 'user_1' });
  });

  it('opening search hides tabs and forces All tab', () => {
    renderWithProviders(<UsersHomeScreen />);

    fireEvent.press(screen.getByTestId('tab-Manager'));
    expect(screen.getByTestId('selected-option').props.children).toBe('Manager');

    fireEvent.press(screen.getByTestId('search-open'));

    expect(screen.getByTestId('selected-option').props.children).toBe('All');
    expect(screen.getByTestId('hide-header-left').props.children).toBe('true');
  });

  it('reloads lists on second focus (returning to screen)', () => {
    renderWithProviders(<UsersHomeScreen />);

    // First focus only arms the guard.
    expect(screen.getByTestId('users-list-reload-all').props.children).toBe('0');

    act(() => {
      latestFocusCallback?.();
    });

    expect(screen.getByTestId('users-list-reload-all').props.children).toBe('1');
  });
});

