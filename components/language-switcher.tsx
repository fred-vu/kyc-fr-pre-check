"use client";

import { useRouter } from "next/navigation";
import { localeCookieName, supportedLocales, type Locale } from "@/lib/i18n/config";
import type { AppDictionary } from "@/lib/i18n/dictionary";

const flags: Record<Locale, string> = {
  en: "🇬🇧",
  fr: "🇫🇷",
};

export function LanguageSwitcher({
  locale,
  labels,
}: {
  locale: Locale;
  labels: AppDictionary["nav"];
}) {
  const router = useRouter();

  function selectLocale(nextLocale: Locale) {
    document.cookie = `${localeCookieName}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = nextLocale;
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1" aria-label={labels.languageLabel}>
      {supportedLocales.map((item) => {
        const active = item === locale;

        return (
          <button
            key={item}
            className={`inline-flex h-9 min-w-10 items-center justify-center rounded-md border px-2 text-sm font-medium transition sm:min-w-11 ${
              active
                ? "border-ink bg-panel text-ink"
                : "border-line bg-white text-muted"
            }`}
            type="button"
            aria-label={item === "en" ? labels.english : labels.french}
            aria-pressed={active}
            title={item === "en" ? labels.english : labels.french}
            onClick={() => selectLocale(item)}
          >
            <span className="text-base leading-none" aria-hidden="true">
              {flags[item]}
            </span>
            <span className="ml-1 text-[11px] uppercase tracking-normal">{item}</span>
          </button>
        );
      })}
    </div>
  );
}
