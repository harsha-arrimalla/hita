import { Platform } from 'react-native';

export const theme = {
  colors: {
    background: '#F3F1EB', // Pi-like warm beige
    text: {
      primary: '#2B2B2B', // Soft Black
      secondary: '#6D6D6D', // Warm Gray
      light: '#FFFFFF',
    },
    chat: {
      bubbleUser: '#EAE6DF', // Darker beige for user
      bubbleHita: '#FFFFFF', // Pure white for Hita (premium feel)
      textUser: '#2B2B2B',
      textHita: '#2B2B2B',
    },
    ui: {
      border: '#DEDBD2', // Warm border
      inputBackground: '#FFFFFF',
      typingDot: '#9F5F3E', // Terracotta accent for thinking
    },
    state: {
      success: '#4CAF50', // Green
      error: '#EF5350',   // Red
      warning: '#FF9800', // Orange
      info: '#2196F3',    // Blue
    }
  },
  fonts: {
    serif: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    sans: Platform.select({ ios: 'System', android: 'sans-serif', default: 'sans-serif' }),
  },
  spacing: {
    xxs: 2,
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    s: 8,
    m: 12,
    l: 24, // More rounded, organic feel (no sharp corners)
    xl: 32, // Pill shape
  },
  typography: {
    hita: {
      // Elegant Serif for AI
      fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
      fontSize: 18,
      lineHeight: 26,
    },
    user: {
      // Clean Sans for User
      fontFamily: Platform.select({ ios: 'System', android: 'sans-serif', default: 'sans-serif' }),
      fontSize: 16,
      lineHeight: 22,
    },
    caption: {
      fontSize: 12,
      lineHeight: 16,
      color: '#8E8E93',
    },
  },
} as const;

export type Theme = typeof theme;
