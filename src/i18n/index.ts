import i18next, { type i18n as I18nInstance } from "i18next";
import en from "./locales/en.json" with { type: "json" };
import zhCN from "./locales/zh-CN.json" with { type: "json" };

export const i18n: I18nInstance = i18next.createInstance();

let initialized = false;

/**
 * Initialize i18n with the specified language or auto-detect.
 * Safe to call multiple times - subsequent calls are no-ops.
 */
export async function initI18n(lng?: string): Promise<I18nInstance> {
  if (initialized) {
    return i18n;
  }

  const detectedLang = lng ?? detectLanguage();

  await i18n.init({
    lng: detectedLang,
    fallbackLng: "en",
    debug: false,
    resources: {
      en: { translation: en },
      "zh-CN": { translation: zhCN },
    },
    interpolation: {
      escapeValue: false,
    },
  });

  initialized = true;
  return i18n;
}

/**
 * Detect language from environment variables.
 * Priority: OPENCLAW_LANG > LANG > default to "en"
 */
function detectLanguage(): string {
  const envLang = process.env.OPENCLAW_LANG || process.env.LANG || "";
  if (envLang.startsWith("zh")) {
    return "zh-CN";
  }
  return "en";
}

/**
 * Translate a key with optional interpolation options.
 * Falls back to the key itself if translation is missing.
 */
export function t(key: string, options?: Record<string, unknown>): string {
  if (!initialized) {
    // If called before init, return the key as-is
    return key;
  }
  return i18n.t(key, options);
}

/**
 * Change the current language.
 */
export function setLanguage(lng: string): Promise<void> {
  return i18n.changeLanguage(lng).then(() => {});
}

/**
 * Get the current language.
 */
export function getLanguage(): string {
  return i18n.language || "en";
}

/**
 * Check if i18n has been initialized.
 */
export function isI18nInitialized(): boolean {
  return initialized;
}
