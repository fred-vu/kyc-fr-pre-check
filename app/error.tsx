"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { defaultLocale, isLocale, localeCookieName, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";

function readBrowserLocale(): Locale {
  const cookie = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${localeCookieName}=`));
  const value = cookie?.split("=")[1];

  return isLocale(value) ? value : defaultLocale;
}

export default function GlobalError() {
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  useEffect(() => {
    setLocale(readBrowserLocale());
  }, []);

  const labels = getDictionary(locale).errors;

  return (
    <main className="mx-auto max-w-3xl px-4 py-section sm:px-6 lg:px-12">
      <div className="rounded-lg border border-line bg-white p-8">
        <h1 className="text-xl font-medium text-ink">{labels.globalTitle}</h1>
        <p className="mt-2 text-sm leading-[1.55] text-muted">
          {labels.globalDescription}
        </p>
        <Link className="mt-5 inline-flex rounded-lg bg-ink px-5 py-3 text-sm font-medium text-white active:bg-[#0d1218]" href="/">
          {labels.returnToSearch}
        </Link>
      </div>
    </main>
  );
}
