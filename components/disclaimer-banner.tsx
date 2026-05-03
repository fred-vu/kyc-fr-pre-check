import { AlertTriangle } from "lucide-react";
import type { AppDictionary } from "@/lib/i18n/dictionary";

export function DisclaimerBanner({ labels }: { labels: AppDictionary["disclaimer"] }) {
  return (
    <section className="print-break-inside-avoid rounded-lg border border-line bg-panel p-4">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 flex-none text-muted" aria-hidden="true" />
        <div className="space-y-2 text-[13px] leading-[1.45] text-muted">
          {labels.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
