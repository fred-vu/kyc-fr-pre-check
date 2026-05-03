"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import type { AppDictionary } from "@/lib/i18n/dictionary";

export function CompanySearchForm({ labels }: { labels: AppDictionary["searchForm"] }) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = identifier.trim();

    if (!normalized) {
      return;
    }

    router.push(`/check/${encodeURIComponent(normalized)}`);
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <label className="block text-sm font-medium text-ink" htmlFor="identifier">
        {labels.identifierLabel}
      </label>
      <input
        className="h-12 w-full rounded-sm border border-line bg-white px-4 text-sm text-ink outline-none transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/15"
        id="identifier"
        inputMode="numeric"
        name="identifier"
        placeholder={labels.placeholder}
        value={identifier}
        onChange={(event) => setIdentifier(event.target.value)}
      />
      <button
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-ink px-5 text-sm font-medium text-white transition active:bg-[#0d1218] focus:outline-none focus:ring-2 focus:ring-accent/40"
        type="submit"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
        {labels.submit}
      </button>
    </form>
  );
}
