/**
 * Main theme configuration
 */

import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius } from './spacing';

export interface Theme {
  colors: typeof colors;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  isDark: boolean;
}

export const lightTheme: Theme = {
  colors: {
    ...colors,
    background: colors.background,
    text: {
      primary: colors.text.lightPrimary,
      secondary: colors.text.lightSecondary,
      tertiary: colors.text.lightTertiary,
    },
  },
  typography,
  spacing,
  borderRadius,
  isDark: false,
};

export const darkTheme: Theme = {
  colors: {
    ...colors,
    background: colors.background,
    text: {
      primary: colors.text.darkPrimary,
      secondary: colors.text.darkSecondary,
      tertiary: colors.text.darkTertiary,
    },
  },
  typography,
  spacing,
  borderRadius,
  isDark: true,
};

export { colors, typography, spacing, borderRadius };
