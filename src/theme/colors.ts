export type ThemeColors = {
  categoryTitle: string;
  badgeBG: string;
  badgeTitle: string;
  badgeBorder: string;
  activeBadgeBG: string;
  favoriteHeart: string;
  description: string;
  text: string;
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  mainBtn: string;
  background: string;
  iconBG: string;
  surface: string;
  error: string;
};

export const lightColors: ThemeColors = {
  categoryTitle: '#364153',
  badgeBG: '#ffffff',
  badgeTitle: '#364153',
  badgeBorder: '#E5E7EB',
  activeBadgeBG: '#009689',
  favoriteHeart: '#FB2C36',

  description: '#F0FDFA',
  text: '#ffffff',
  title: '#101828',
  subtitle: '#6A7282',

  searchPlaceholder: 'rgba(10, 10, 10, 0.5)',
  mainBtn: '#99A1AF',

  background: '#ffffff',
  iconBG: '#F3F4F6',
  surface: '#ffffff',
  error: '#ff0000',
};

export const darkColors: ThemeColors = {
  categoryTitle: '#E5E7EB',
  badgeBG: '#1F2937',
  badgeTitle: '#E5E7EB',
  badgeBorder: '#374151',
  activeBadgeBG: '#14B8A6',
  favoriteHeart: '#FB2C36',

  description: '#111827',
  text: '#111827',
  title: '#F9FAFB',
  subtitle: '#9CA3AF',

  searchPlaceholder: 'rgba(255, 255, 255, 0.5)',
  mainBtn: '#9CA3AF',

  background: '#111827',
  iconBG: '#374151',
  surface: '#1F2937',
  error: '#EF4444',
};

export const colors = lightColors;
