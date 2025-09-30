/**
 * تكوين الأمان للفيديو
 * يحتوي على جميع الإعدادات الأمنية للتطبيق
 */

export const SECURITY_CONFIG = {
  // إعدادات التشفير
  ENCRYPTION: {
    ALGORITHM: "AES",
    KEY_SIZE: 256,
    IV_SIZE: 16,
    DEFAULT_KEY: "default-key-change-in-production",
  },

  // إعدادات الرموز المؤقتة
  TOKENS: {
    EXPIRY_TIME: 30 * 60 * 1000, // 30 دقيقة
    MAX_VIEWS: 3,
    CLEANUP_INTERVAL: 5 * 60 * 1000, // 5 دقائق
    MAX_VIOLATIONS: 5,
  },

  // إعدادات HLS/DASH
  STREAMING: {
    MAX_BUFFER_LENGTH: 30,
    MAX_MAX_BUFFER_LENGTH: 60,
    FRAG_LOADING_TIMEOUT: 20000,
    MANIFEST_LOADING_TIMEOUT: 10000,
    FRAG_LOADING_ERROR_RETRY: 1,
    ENABLE_SOFTWARE_AES: true,
  },

  // إعدادات المراقبة
  MONITORING: {
    DEV_TOOLS_CHECK_INTERVAL: 1000,
    DOM_MUTATION_OBSERVER: true,
    NETWORK_REQUEST_MONITORING: true,
    VIOLATION_REPORTING: true,
  },

  // اختصارات لوحة المفاتيح المحظورة
  FORBIDDEN_KEYBOARD_SHORTCUTS: [
    { key: "F12", name: "Developer Tools" },
    { key: "F5", name: "Refresh" },
    { ctrl: true, shift: true, key: "I", name: "Developer Tools" },
    { ctrl: true, shift: true, key: "C", name: "Developer Tools" },
    { ctrl: true, key: "U", name: "View Source" },
    { ctrl: true, key: "S", name: "Save Page" },
    { ctrl: true, key: "A", name: "Select All" },
    { ctrl: true, key: "C", name: "Copy" },
    { ctrl: true, key: "V", name: "Paste" },
    { ctrl: true, key: "X", name: "Cut" },
    { ctrl: true, key: "P", name: "Print" },
    { ctrl: true, key: "F", name: "Find" },
    { ctrl: true, key: "H", name: "History" },
    { ctrl: true, key: "J", name: "Downloads" },
    { ctrl: true, key: "K", name: "Search" },
    { ctrl: true, key: "L", name: "Address Bar" },
    { ctrl: true, key: "N", name: "New Window" },
    { ctrl: true, key: "T", name: "New Tab" },
    { ctrl: true, key: "W", name: "Close Tab" },
    { ctrl: true, key: "R", name: "Reload" },
    { ctrl: true, key: "D", name: "Bookmark" },
  ],

  // أنواع الانتهاكات الأمنية
  VIOLATION_TYPES: {
    CONTEXT_MENU_ABUSE: "context_menu_abuse",
    KEYBOARD_SHORTCUT_ABUSE: "keyboard_shortcut_abuse",
    DRAG_DROP_ATTEMPT: "drag_drop_attempt",
    TEXT_SELECTION_ATTEMPT: "text_selection_attempt",
    COPY_ATTEMPT: "copy_attempt",
    PRINT_ATTEMPT: "print_attempt",
    DOWNLOAD_LINK_INJECTION: "download_link_injection",
    SCRIPT_INJECTION: "script_injection",
    DEV_TOOLS_OPENED: "dev_tools_opened",
    ACCESS_DENIED: "access_denied",
    HLS_ERROR: "hls_error",
    VIDEO_LOAD_ERROR: "video_load_error",
  },

  // رسائل الخطأ
  ERROR_MESSAGES: {
    INVALID_URL: "Invalid or corrupted video URL",
    EXPIRED_URL: "Video URL has expired",
    MAX_VIEWS_EXCEEDED: "Maximum views exceeded",
    TOKEN_NOT_FOUND: "Token not found",
    TOKEN_INVALID: "Token is invalid",
    TOKEN_EXPIRED: "Token has expired",
    TOKEN_MISMATCH: "Token mismatch",
    ACCESS_VALIDATION_FAILED: "Access validation failed",
  },
};

// دالة للحصول على مفتاح التشفير من متغيرات البيئة
export const getEncryptionKey = () => {
  return (
    import.meta.env.VITE_VIDEO_ENCRYPTION_KEY ||
    SECURITY_CONFIG.ENCRYPTION.DEFAULT_KEY
  );
};

// دالة للحصول على إعدادات الرموز المؤقتة
export const getTokenConfig = () => {
  return {
    expiry:
      parseInt(import.meta.env.VITE_VIDEO_TOKEN_EXPIRY) ||
      SECURITY_CONFIG.TOKENS.EXPIRY_TIME,
    maxViews:
      parseInt(import.meta.env.VITE_MAX_VIDEO_VIEWS) ||
      SECURITY_CONFIG.TOKENS.MAX_VIEWS,
    maxViolations: SECURITY_CONFIG.TOKENS.MAX_VIOLATIONS,
  };
};

// دالة للتحقق من تفعيل المراقبة الأمنية
export const isSecurityMonitoringEnabled = () => {
  return import.meta.env.VITE_SECURITY_MONITORING === "true" || true;
};

export default SECURITY_CONFIG;
