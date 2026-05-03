import Link from "next/link";
import { getCurrentDictionary } from "@/lib/i18n/server";

export default async function NotFoundPage() {
  const { dictionary } = await getCurrentDictionary();

  return (
    <main className="mx-auto max-w-3xl px-4 py-section sm:px-6 lg:px-12">
      <div className="rounded-lg border border-line bg-white p-8">
        <h1 className="text-xl font-medium text-ink">{dictionary.errors.notFoundTitle}</h1>
        <p className="mt-2 text-sm leading-[1.55] text-muted">{dictionary.errors.notFoundDescription}</p>
        <Link className="mt-5 inline-flex rounded-lg bg-ink px-5 py-3 text-sm font-medium text-white active:bg-[#0d1218]" href="/">
          {dictionary.errors.returnToSearch}
        </Link>
      </div>
    </main>
  );
}
