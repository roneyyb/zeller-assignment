import SearchBarExpandWithButton from '@/src/components/search-bar/SearchBarExpandWithButton';
import React from 'react';

export type SearchProps = {
  value: string;
  onChangeText: (text: string) => void;
  onOpenChange?: (open: boolean) => void;
  containerWidth: number | string;
  height: number;
};

export function Search({
  value,
  onChangeText,
  onOpenChange,
  containerWidth = 44,
  height = 44,
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
      height={height}
      collapsedWidth={height}
      borderRadius={16}
      containerStyle={{
        alignItems: 'flex-end',
      }}
    />
  );
}
