"use client";

import { FileDown } from "lucide-react";

export function GenerateFullPdfButton({
  label,
  isDark,
}: {
  label: string;
  isDark: boolean;
}) {
  return (
    <button
      className={`no-print mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-center text-sm font-medium leading-snug transition focus:outline-none focus:ring-2 focus:ring-accent/40 ${
        isDark
          ? "border border-white bg-white text-ink active:bg-white/90"
          : "bg-ink text-white active:bg-[#0d1218]"
      }`}
      type="button"
      onClick={() => window.print()}
    >
      <FileDown className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}
