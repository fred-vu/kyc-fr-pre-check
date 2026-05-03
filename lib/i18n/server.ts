import { cookies, headers } from "next/headers";
import { defaultLocale, isLocale, localeCookieName, type Locale } from "./config";
import { getDictionary } from "./dictionary";

function localeFromAcceptLanguage(value: string | null): Locale | undefined {
  if (!value) {
    return undefined;
  }

  const languages = value
    .split(",")
    .map((item) => item.split(";")[0]?.trim().toLowerCase())
    .filter(Boolean);

  for (const language of languages) {
    const base = language.split("-")[0];

    if (isLocale(base)) {
      return base;
    }
  }

  return undefined;
}

export async function getCurrentLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(localeCookieName)?.value;

  if (isLocale(cookieLocale)) {
    return cookieLocale;
  }

  const headerStore = await headers();
  return localeFromAcceptLanguage(headerStore.get("accept-language")) ?? defaultLocale;
}

export async function getCurrentDictionary() {
  const locale = await getCurrentLocale();

  return {
    locale,
    dictionary: getDictionary(locale),
  };
}
