/**
 * Reusable Button Component
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '@theme/index';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.button,
      ...styles[`button_${size}`],
    };

    if (disabled) {
      return { ...baseStyle, ...styles.buttonDisabled };
    }

    switch (variant) {
      case 'secondary':
        return { ...baseStyle, ...styles.buttonSecondary };
      case 'outline':
        return { ...baseStyle, ...styles.buttonOutline };
      default:
        return { ...baseStyle, ...styles.buttonPrimary };
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      ...styles.text,
      ...styles[`text_${size}`],
    };

    if (disabled) {
      return { ...baseStyle, ...styles.textDisabled };
    }

    switch (variant) {
      case 'secondary':
        return { ...baseStyle, ...styles.textSecondary };
      case 'outline':
        return { ...baseStyle, ...styles.textOutline };
      default:
        return { ...baseStyle, ...styles.textPrimary };
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.background.dark : colors.primary.gold}
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button_small: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  button_medium: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  button_large: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  buttonPrimary: {
    backgroundColor: colors.primary.gold,
  },
  buttonSecondary: {
    backgroundColor: colors.background.darkTertiary,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary.gold,
  },
  buttonDisabled: {
    backgroundColor: colors.background.darkTertiary,
    opacity: 0.5,
  },
  text: {
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
  },
  text_small: {
    fontSize: typography.fontSize.sm,
  },
  text_medium: {
    fontSize: typography.fontSize.base,
  },
  text_large: {
    fontSize: typography.fontSize.lg,
  },
  textPrimary: {
    color: colors.background.dark,
  },
  textSecondary: {
    color: colors.text.darkPrimary,
  },
  textOutline: {
    color: colors.primary.gold,
  },
  textDisabled: {
    color: colors.text.darkTertiary,
  },
});

export default Button;
