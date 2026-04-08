import SearchBarExpandWithButton from '@/src/components/search-bar/SearchBarExpandWithButton';
import React from 'react';
import type { DimensionValue } from 'react-native';

export type SearchProps = {
  value: string;
  onChangeText: (text: string) => void;
  onOpenChange?: (open: boolean) => void;
  containerWidth?: DimensionValue;
};

export function Search({
  value,
  onChangeText,
  onOpenChange,
  containerWidth = 44,
}: SearchProps) {
  return (
    <SearchBarExpandWithButton
      value={value}
      onChangeText={onChangeText}
      placeholder="Search users"
      onOpenChange={(open) => {
        if (!open) onChangeText('');
        onOpenChange?.(open);
      }}
      // Inline icon next to segmented control
      height={44}
      collapsedWidth={44}
      borderRadius={16}
      containerStyle={{ alignItems: 'flex-end', width: containerWidth }}
    />
  );
}
