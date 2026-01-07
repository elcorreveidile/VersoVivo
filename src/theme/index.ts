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
  colors,
  typography,
  spacing,
  borderRadius,
  isDark: false,
};

export const darkTheme: Theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  isDark: true,
};

export { colors, typography, spacing, borderRadius };
