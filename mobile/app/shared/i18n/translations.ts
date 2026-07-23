/**
 * VI/EN parity is a VieGo non-negotiable (architecture principles). Every user-facing
 * string lives here; nothing is hard-coded in components.
 */
export type Locale = 'vi' | 'en';

export const translations = {
  en: {
    'app.name': 'VieGo',
    'tab.map': 'Map',
    'tab.collection': 'Collection',
    'tab.streak': 'Streak',
    'tab.profile': 'Profile',
    'auth.welcome': 'Welcome to VieGo',
    'auth.signIn': 'Sign in',
    'auth.register': 'Create account',
    'status.title': 'Backend connectivity',
    'status.checking': 'Checking connection…',
    'status.healthy': 'Connected — backend is healthy',
    'status.error': 'Cannot reach the backend',
    'status.retry': 'Retry',
    'placeholder.map': 'The interactive map lands in Phase 2.',
    'placeholder.collection': 'Your unlocked provinces appear here.',
    'placeholder.streak': 'Your daily streak lands in Phase 3.',
    'placeholder.profile': 'Preferences (language + theme).',
    'action.toggleTheme': 'Toggle theme',
    'action.toggleLanguage': 'Tiếng Việt',
  },
  vi: {
    'app.name': 'VieGo',
    'tab.map': 'Bản đồ',
    'tab.collection': 'Bộ sưu tập',
    'tab.streak': 'Chuỗi ngày',
    'tab.profile': 'Hồ sơ',
    'auth.welcome': 'Chào mừng đến với VieGo',
    'auth.signIn': 'Đăng nhập',
    'auth.register': 'Tạo tài khoản',
    'status.title': 'Kết nối máy chủ',
    'status.checking': 'Đang kiểm tra kết nối…',
    'status.healthy': 'Đã kết nối — máy chủ hoạt động tốt',
    'status.error': 'Không thể kết nối máy chủ',
    'status.retry': 'Thử lại',
    'placeholder.map': 'Bản đồ tương tác sẽ có ở Giai đoạn 2.',
    'placeholder.collection': 'Các tỉnh đã mở khóa sẽ hiển thị ở đây.',
    'placeholder.streak': 'Chuỗi ngày sẽ có ở Giai đoạn 3.',
    'placeholder.profile': 'Tùy chọn (ngôn ngữ + giao diện).',
    'action.toggleTheme': 'Đổi giao diện',
    'action.toggleLanguage': 'English',
  },
} as const;

export type TranslationKey = keyof (typeof translations)['en'];
