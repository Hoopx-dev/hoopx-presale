/**
 * HOOPX Theme Configuration
 *
 * This file contains the color system and theme constants used throughout the application.
 * Colors are also defined in globals.css for Tailwind CSS usage.
 */

export const colors = {
  primary: '#512784',
  secondary: '#FCB825',
  success: '#31D99C',
  danger: '#FF4B4B',
} as const;

export const theme = {
  colors: {
    // Brand Colors
    primary: {
      DEFAULT: '#512784',
      rgb: '81, 39, 132',
      light: '#6B34A8',
      dark: '#3D1D63',
    },
    secondary: {
      DEFAULT: '#FCB825',
      rgb: '252, 184, 37',
      light: '#FDC651',
      dark: '#E5A51E',
    },
    success: {
      DEFAULT: '#31D99C',
      rgb: '49, 217, 156',
      light: '#5DE0AD',
      dark: '#28B882',
    },
    danger: {
      DEFAULT: '#FF4B4B',
      rgb: '255, 75, 75',
      light: '#FF6B6B',
      dark: '#E63C3C',
    },
  },
} as const;

export type ThemeColor = keyof typeof colors;

export default theme;
