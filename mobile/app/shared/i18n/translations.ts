/**
 * VI/EN parity is a VieGo non-negotiable. Every user-facing string lives here; nothing is
 * hard-coded in a component (FR-034).
 *
 * Only `vi` and `en` carry full string tables (spec Assumptions). `ko`/`ja`/`fr` are
 * selectable in Language Select via `LOCALE_META` (native label + code) but fall back to `en`
 * strings until a later feature adds their tables — see `translations` proxy note below.
 */
export type Locale = 'vi' | 'en' | 'ko' | 'ja' | 'fr';

/** Locales with a complete string table this feature. */
export type FullLocale = 'vi' | 'en';

const strings = {
  en: {
    'app.name': 'VieGo',

    // Language Select (US1)
    'identity.language.title': 'Xin chào!\nPick your language',
    'identity.language.subtitle': 'You can change this any time in your profile.',
    'identity.language.continue': 'Continue',

    // Log in (US3)
    'identity.login.title': 'Welcome back',
    'identity.login.subtitle': 'Log in and keep the streak burning.',
    'identity.login.email': 'Email',
    'identity.login.password': 'Password',
    'identity.login.forgot': 'Quên mật khẩu?',
    'identity.login.submit': 'Log in',
    'identity.login.orContinue': 'or continue with',
    'identity.login.noAccount': 'New to VieGo?',
    'identity.login.createAccount': 'Create account',
    'identity.login.error': 'Email or password is incorrect. Please try again.',

    // Register (US2)
    'identity.register.title': 'Tạo tài khoản',
    'identity.register.subtitle': 'Join VieGo and start unlocking provinces.',
    'identity.register.name': 'Full name',
    'identity.register.email': 'Email',
    'identity.register.password': 'Password',
    'identity.register.submit': 'Create account',
    'identity.register.orSignUp': 'or sign up with',
    'identity.register.haveAccount': 'Already have an account?',
    'identity.register.login': 'Log in',
    'identity.register.consent': 'By creating an account you agree to the Terms and Privacy Policy.',
    'identity.register.errorDuplicate': 'An account with this email already exists.',

    // Onboarding (US2)
    'identity.onboarding.skip': 'Skip',
    'identity.onboarding.slide1.title': 'Your Vietnam,\none beat at a time',
    'identity.onboarding.slide1.sub':
      'A living map of every province — phở stalls, pagodas, and corners only locals know.',
    'identity.onboarding.slide2.title': 'Snap it. It lands\non their map.',
    'identity.onboarding.slide2.sub':
      'One tap opens the camera. Your photo auto-tags where you are and appears on your friends’ feeds instantly.',
    'identity.onboarding.slide3.title': 'Keep the streak\nburning',
    'identity.onboarding.slide3.sub':
      'One capture a day grows your streak and unlocks provinces. Miss a day, lose the fire.',
    'identity.onboarding.next': 'Next',
    'identity.onboarding.start': 'Bắt đầu — Get started',

    // Main placeholder (US2)
    'identity.main.title': 'You’re all set',
    'identity.main.subtitle': 'The living map lands here soon. Keep an eye on your streak.',

    // Field validation
    'validation.required': 'This field is required.',
    'validation.email': 'Enter a valid email address.',
    'validation.password': 'Password must be at least 6 characters.',

    // Legacy Phase-0 keys (pre-migration screens under app/screens — dead under expo-router
    // but kept so those files still type-check; do not use in new screens).
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

    'identity.language.title': 'Xin chào!\nChọn ngôn ngữ của bạn',
    'identity.language.subtitle': 'Bạn có thể thay đổi bất cứ lúc nào trong hồ sơ.',
    'identity.language.continue': 'Tiếp tục',

    'identity.login.title': 'Chào mừng trở lại',
    'identity.login.subtitle': 'Đăng nhập và giữ chuỗi ngày cháy sáng.',
    'identity.login.email': 'Email',
    'identity.login.password': 'Mật khẩu',
    'identity.login.forgot': 'Quên mật khẩu?',
    'identity.login.submit': 'Đăng nhập',
    'identity.login.orContinue': 'hoặc tiếp tục với',
    'identity.login.noAccount': 'Mới biết VieGo?',
    'identity.login.createAccount': 'Tạo tài khoản',
    'identity.login.error': 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.',

    'identity.register.title': 'Tạo tài khoản',
    'identity.register.subtitle': 'Tham gia VieGo và bắt đầu mở khóa các tỉnh.',
    'identity.register.name': 'Họ và tên',
    'identity.register.email': 'Email',
    'identity.register.password': 'Mật khẩu',
    'identity.register.submit': 'Tạo tài khoản',
    'identity.register.orSignUp': 'hoặc đăng ký với',
    'identity.register.haveAccount': 'Đã có tài khoản?',
    'identity.register.login': 'Đăng nhập',
    'identity.register.consent': 'Bằng việc tạo tài khoản, bạn đồng ý với Điều khoản và Chính sách bảo mật.',
    'identity.register.errorDuplicate': 'Đã tồn tại tài khoản với email này.',

    'identity.onboarding.skip': 'Bỏ qua',
    'identity.onboarding.slide1.title': 'Việt Nam của bạn,\ntừng nhịp một',
    'identity.onboarding.slide1.sub':
      'Bản đồ sống của mọi tỉnh thành — quán phở, ngôi chùa, và những góc chỉ người địa phương biết.',
    'identity.onboarding.slide2.title': 'Chụp lại. Nó hiện\ntrên bản đồ của họ.',
    'identity.onboarding.slide2.sub':
      'Một chạm mở camera. Ảnh của bạn tự gắn vị trí và xuất hiện trên bảng tin của bạn bè ngay lập tức.',
    'identity.onboarding.slide3.title': 'Giữ chuỗi ngày\ncháy sáng',
    'identity.onboarding.slide3.sub':
      'Mỗi ngày một tấm ảnh giúp chuỗi ngày lớn lên và mở khóa các tỉnh. Bỏ lỡ một ngày, mất ngọn lửa.',
    'identity.onboarding.next': 'Tiếp',
    'identity.onboarding.start': 'Bắt đầu — Get started',

    'identity.main.title': 'Bạn đã sẵn sàng',
    'identity.main.subtitle': 'Bản đồ sống sẽ xuất hiện ở đây. Hãy để mắt tới chuỗi ngày của bạn.',

    'validation.required': 'Trường này là bắt buộc.',
    'validation.email': 'Nhập một địa chỉ email hợp lệ.',
    'validation.password': 'Mật khẩu phải có ít nhất 6 ký tự.',

    // Legacy Phase-0 keys (see en table note).
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

export type TranslationKey = keyof (typeof strings)['en'];

/**
 * Selectable-locale metadata for the Language Select picker (FR-034 / spec Assumptions).
 * `nativeLabel` stays untranslated regardless of active locale.
 */
export interface LocaleMeta {
  code: Locale;
  /** Two-letter chip shown in the 38px code circle. */
  chip: string;
  nativeLabel: string;
  /** English name of the language, shown as the row subtitle. */
  englishName: string;
  /** Whether a full string table exists this feature. */
  full: boolean;
}

export const LOCALE_META: LocaleMeta[] = [
  { code: 'vi', chip: 'VI', nativeLabel: 'Tiếng Việt', englishName: 'Vietnamese', full: true },
  { code: 'en', chip: 'EN', nativeLabel: 'English', englishName: 'English (US)', full: true },
  { code: 'ko', chip: 'KO', nativeLabel: '한국어', englishName: 'Korean', full: false },
  { code: 'ja', chip: 'JA', nativeLabel: '日本語', englishName: 'Japanese', full: false },
  { code: 'fr', chip: 'FR', nativeLabel: 'Français', englishName: 'French', full: false },
];

export const SUPPORTED_LOCALES: Locale[] = LOCALE_META.map((m) => m.code);

/**
 * String tables keyed by every supported locale. Locales without a full table (ko/ja/fr) fall
 * back to English strings while still being selectable in the picker (spec Assumptions).
 */
export const translations: Record<Locale, Record<TranslationKey, string>> = {
  vi: strings.vi,
  en: strings.en,
  ko: strings.en,
  ja: strings.en,
  fr: strings.en,
};
