import type { Metadata } from "next";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getCurrentDictionary } from "@/lib/i18n/server";
import "./globals.css";

export const metadata: Metadata = {
  title: "French Company KYC Pre-Check",
  description:
    "Demo-first operational pre-check prototype for French company KYC review.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <LocalizedLayout>{children}</LocalizedLayout>;
}

async function LocalizedLayout({ children }: { children: React.ReactNode }) {
  const { locale, dictionary } = await getCurrentDictionary();
  const footerDateLocale = locale === "fr" ? "fr-FR" : "en-GB";

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-white text-ink antialiased">
        <header className="no-print bg-white">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-12">
            <Link className="text-base font-medium text-ink" href="/">
              {dictionary.appName}
            </Link>
            <nav className="flex items-center gap-3 text-sm font-normal">
              <Link className="text-muted" href="/demo">
                {dictionary.nav.demo}
              </Link>
              <a className="text-muted" href="https://www.data.gouv.fr/" rel="noreferrer" target="_blank">
                {dictionary.nav.sources}
              </a>
              <LanguageSwitcher locale={locale} labels={dictionary.nav} />
            </nav>
          </div>
        </header>
        {children}
        <footer className="no-print border-t border-line bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-12 text-[13px] leading-6 text-muted sm:px-6 lg:px-12">
            <p>{dictionary.footer.disclaimer}</p>
            <p>{dictionary.footer.sources}</p>
            <p>
              {dictionary.footer.updated}: {new Date().toLocaleDateString(footerDateLocale)}
            </p>
            <p className="flex items-center gap-2">
              <span>{dictionary.footer.credit}</span>
              <a
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white text-ink"
                href="https://github.com/fred-vu"
                rel="noreferrer"
                target="_blank"
                aria-label="GitHub: Fred-Vu"
                title="GitHub: Fred-Vu"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.16 1.18A10.98 10.98 0 0 1 12 6.2c.98 0 1.96.13 2.88.39 2.19-1.49 3.15-1.18 3.15-1.18.63 1.58.24 2.75.12 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.42.36.78 1.06.78 2.14v3.01c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
                </svg>
              </a>
            </p>
          </div>
        </footer>
        <div className="print-credit">2026 - from Paris by Fred-Vu - https://github.com/fred-vu</div>
      </body>
    </html>
  );
}
