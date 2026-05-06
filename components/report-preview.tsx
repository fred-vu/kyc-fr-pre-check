"use client";

import { useState } from "react";
import { Clipboard, FileJson, Printer, ScrollText } from "lucide-react";
import type { AppDictionary } from "@/lib/i18n/dictionary";
import type { EvidencePayload } from "@/types/report";

const creditLine = "2026 - from Paris by Fred-Vu - https://github.com/fred-vu";

export function ReportPreview({
  markdown,
  evidencePayload,
  escalationMemo,
  labels,
}: {
  markdown: string;
  evidencePayload: EvidencePayload;
  escalationMemo?: string;
  labels: AppDictionary["reportPreview"];
}) {
  const [copied, setCopied] = useState(false);
  const [memoCopied, setMemoCopied] = useState(false);

  async function copyReport() {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function copyEscalationMemo() {
    if (!escalationMemo) {
      return;
    }

    await navigator.clipboard.writeText(escalationMemo);
    setMemoCopied(true);
    window.setTimeout(() => setMemoCopied(false), 1800);
  }

  function downloadJsonPayload() {
    const blob = new Blob([JSON.stringify(evidencePayload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${evidencePayload.caseId}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  function printReport() {
    const printWindow = window.open("", "_blank", "width=960,height=1200");

    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.open();
    printWindow.document.write(`<!doctype html>
<html>
  <head>
    <title>${escapeHtml(labels.title)}</title>
    <style>
      @page {
        margin: 16mm;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background: #ffffff;
        color: #181d26;
        font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      pre {
        margin: 0;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        color: #181d26;
        font: 11pt/1.45 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
      }

      .credit {
        margin: 24px 0 0;
        border-top: 1px solid #e0e2e6;
        padding-top: 12px;
        color: #5f6368;
        font: 10pt/1.4 Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
    </style>
  </head>
  <body>
    <pre>${escapeHtml(markdown)}</pre>
    <p class="credit">${escapeHtml(creditLine)}</p>
  </body>
</html>`);
    printWindow.document.close();
    printWindow.focus();
    window.setTimeout(() => printWindow.print(), 100);
  }

  return (
    <section className="report-print-card print-break-inside-avoid min-w-0 rounded-lg border border-line bg-white p-5 sm:p-8">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.05em] text-muted">{labels.eyebrow}</p>
          <h2 className="mt-2 text-lg font-medium leading-[1.4] text-ink">{labels.title}</h2>
        </div>
      </div>

      <div className="no-print mb-4 grid gap-2 md:grid-cols-2">
        <button
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-center text-sm font-medium leading-snug text-ink active:bg-panel"
          type="button"
          onClick={copyReport}
        >
          <Clipboard className="h-4 w-4" aria-hidden="true" />
          {copied ? labels.copied : labels.copy}
        </button>
        <button
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-center text-sm font-medium leading-snug text-ink active:bg-panel"
          type="button"
          onClick={downloadJsonPayload}
        >
          <FileJson className="h-4 w-4" aria-hidden="true" />
          {labels.downloadJson}
        </button>
        {escalationMemo ? (
          <button
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-center text-sm font-medium leading-snug text-ink active:bg-panel"
            type="button"
            onClick={copyEscalationMemo}
          >
            <ScrollText className="h-4 w-4" aria-hidden="true" />
            {memoCopied ? labels.copiedEscalationMemo : labels.copyEscalationMemo}
          </button>
        ) : null}
        <button
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-center text-sm font-medium leading-snug text-ink active:bg-panel"
          type="button"
          onClick={printReport}
        >
          <Printer className="h-4 w-4" aria-hidden="true" />
          {labels.print}
        </button>
      </div>

      <pre className="report-markdown-preview max-h-[60vh] max-w-full overflow-auto whitespace-pre-wrap break-words rounded-md border border-line bg-slate-950 p-4 text-xs leading-6 text-slate-100 sm:max-h-[520px]">
        {markdown}
      </pre>
    </section>
  );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
