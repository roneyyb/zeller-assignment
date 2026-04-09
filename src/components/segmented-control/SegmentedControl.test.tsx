import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';

import { renderWithProviders } from '@/src/test/renderWithProviders';

import SegmentedControl from './SegmentedControl';

describe('SegmentedControl', () => {
  it('renders options and calls onOptionPress/onValueChange', () => {
    const onOptionPress = jest.fn();
    const onValueChange = jest.fn();

    renderWithProviders(
      <SegmentedControl
        options={['All', 'Admin', 'Manager']}
        selectedOption="All"
        onOptionPress={onOptionPress}
        onValueChange={onValueChange}
        showIndicator={false}
      />,
    );

    fireEvent.press(screen.getByText('Admin '));
    expect(onOptionPress).toHaveBeenCalledWith('Admin');
    expect(onValueChange).toHaveBeenCalledWith('Admin', 1);
  });

  it('does not fire when disabled', () => {
    const onOptionPress = jest.fn();
    renderWithProviders(
      <SegmentedControl
        options={['All', 'Admin']}
        selectedOption="All"
        onOptionPress={onOptionPress}
        disabled
        showIndicator={false}
      />,
    );

    fireEvent.press(screen.getByText('Admin '));
    expect(onOptionPress).not.toHaveBeenCalled();
  });

  it('supports object options with disabled flag', () => {
    const onOptionPress = jest.fn();
    renderWithProviders(
      <SegmentedControl
        options={[
          { key: 'all', label: 'All' },
          { key: 'admin', label: 'Admin', disabled: true },
        ]}
        selectedOption="all"
        onOptionPress={onOptionPress}
        showIndicator={false}
      />,
    );

    fireEvent.press(screen.getByText('Admin '));
    expect(onOptionPress).not.toHaveBeenCalled();
  });
});

