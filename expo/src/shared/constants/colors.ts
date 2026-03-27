/**
 * Application color palette
 * Centralized color definitions for consistent theming
 */
export const AppColors = {
  // Primary colors
  primary: '#0077b6',
  primaryLight: '#EEF2FF',
  primaryDark: '#005577',
  
  // Secondary colors
  secondary: '#6366F1',
  secondaryLight: '#E0E7FF',
  secondaryDark: '#4338CA',
  
  // Status colors
  success: '#10B981',
  successLight: '#ECFDF5',
  successDark: '#047857',
  
  error: '#EF4444',
  errorLight: '#FEF2F2',
  errorDark: '#DC2626',
  
  warning: '#F59E0B',
  warningLight: '#FFFBEB',
  warningDark: '#D97706',
  
  info: '#3B82F6',
  infoLight: '#EFF6FF',
  infoDark: '#1D4ED8',
  
  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  
  // Gray scale
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
} as const;

/**
 * Light theme colors
 */
export const lightColors = {
  primary: AppColors.primary,
  primaryLight: AppColors.primaryLight,
  secondary: AppColors.secondary,
  secondaryLight: AppColors.secondaryLight,
  
  success: AppColors.success,
  successLight: AppColors.successLight,
  error: AppColors.error,
  errorLight: AppColors.errorLight,
  warning: AppColors.warning,
  warningLight: AppColors.warningLight,
  
  text: AppColors.gray900,
  textSecondary: AppColors.gray600,
  
  background: AppColors.white,
  backgroundAccent: AppColors.gray50,
  border: AppColors.gray200,
  
  // Component specific colors
  cardBackground: AppColors.white,
  inputBackground: AppColors.white,
  buttonBackground: AppColors.primary,
  buttonText: AppColors.white,
} as const;

/**
 * Dark theme colors
 */
export const darkColors = {
  primary: AppColors.primary,
  primaryLight: '#312E81',
  secondary: '#818CF8',
  secondaryLight: '#3730A3',
  
  success: '#34D399',
  successLight: '#064E3B',
  error: '#F87171',
  errorLight: '#7F1D1D',
  warning: '#FBBF24',
  warningLight: '#78350F',
  
  text: AppColors.gray50,
  textSecondary: AppColors.gray400,
  
  background: AppColors.gray900,
  backgroundAccent: AppColors.gray800,
  border: AppColors.gray700,
  
  // Component specific colors
  cardBackground: AppColors.gray800,
  inputBackground: AppColors.gray800,
  buttonBackground: AppColors.primary,
  buttonText: AppColors.white,
} as const;

/**
 * Color utility functions
 */
export const ColorUtils = {
  /**
   * Add opacity to a hex color
   */
  addOpacity: (color: string, opacity: number): string => {
    const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
    return `${color}${alpha}`;
  },

  /**
   * Get contrast color (black or white) for a given background color
   */
  getContrastColor: (backgroundColor: string): string => {
    // Simple contrast calculation
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? AppColors.black : AppColors.white;
  },

  /**
   * Lighten a color by a percentage
   */
  lighten: (color: string, percent: number): string => {
    const hex = color.replace('#', '');
    const r = Math.min(255, Math.round(parseInt(hex.substr(0, 2), 16) * (1 + percent / 100)));
    const g = Math.min(255, Math.round(parseInt(hex.substr(2, 2), 16) * (1 + percent / 100)));
    const b = Math.min(255, Math.round(parseInt(hex.substr(4, 2), 16) * (1 + percent / 100)));
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  },

  /**
   * Darken a color by a percentage
   */
  darken: (color: string, percent: number): string => {
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.round(parseInt(hex.substr(0, 2), 16) * (1 - percent / 100)));
    const g = Math.max(0, Math.round(parseInt(hex.substr(2, 2), 16) * (1 - percent / 100)));
    const b = Math.max(0, Math.round(parseInt(hex.substr(4, 2), 16) * (1 - percent / 100)));
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  },
};