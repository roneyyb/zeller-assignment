import React from 'react';
import { StyleProp, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';

import { useAppTheme } from '@/src/utils/theme';

export type FormTextFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  placeholder: string;
  errorMessage?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputProps?: Omit<TextInputProps, 'value' | 'onChangeText' | 'placeholder' | 'onBlur' | 'style'>;
  inputStyle?: TextInputProps['style'];
};

export default function FormTextField({
  value,
  onChangeText,
  onBlur,
  placeholder,
  errorMessage,
  containerStyle,
  inputProps,
  inputStyle,
}: FormTextFieldProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.field, containerStyle]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={[
          styles.input,
          {
            color: colors.text,
            borderColor: errorMessage ? colors.error : colors.border,
          },
          inputStyle,
        ]}
        {...inputProps}
      />
      {errorMessage ? (
        <Text style={{ color: colors.error, marginTop: 6 }}>{errorMessage}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginTop: 22 },
  input: {
    height: 50,
    borderBottomWidth: StyleSheet.hairlineWidth,
    fontSize: 18,
    paddingVertical: 6,
  },
});

