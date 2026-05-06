import { AlertTriangle, CheckCircle2, CircleHelp, ShieldAlert } from "lucide-react";
import type { AppDictionary } from "@/lib/i18n/dictionary";
import type { ReviewOutcome } from "@/types/risk";

const styles: Record<ReviewOutcome, string> = {
  PASS_PRE_CHECK: "border-[#a7f3d0] bg-[#ecfdf5] text-[#065f46]",
  MANUAL_REVIEW_REQUIRED: "border-[#fde68a] bg-[#fefce8] text-[#854d0e]",
  ESCALATE_BEFORE_ONBOARDING: "border-[#fecaca] bg-[#fef2f2] text-[#991b1b]",
  INSUFFICIENT_DATA: "border-slate-300 bg-slate-50 text-slate-700",
};

const icons = {
  PASS_PRE_CHECK: CheckCircle2,
  MANUAL_REVIEW_REQUIRED: CircleHelp,
  ESCALATE_BEFORE_ONBOARDING: ShieldAlert,
  INSUFFICIENT_DATA: AlertTriangle,
};

export function ReviewOutcomeCard({
  outcome,
  labels,
}: {
  outcome: ReviewOutcome;
  labels: AppDictionary["reviewOutcome"];
}) {
  const Icon = icons[outcome];

  return (
    <section className={`print-break-inside-avoid rounded-lg border p-5 sm:p-6 ${styles[outcome]}`}>
      <div className="flex gap-3">
        <Icon className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.05em] opacity-75">{labels.eyebrow}</p>
          <h2 className="mt-2 text-lg font-medium leading-[1.35]">{labels.labels[outcome]}</h2>
          <p className="mt-2 text-sm leading-[1.55] opacity-90">{labels.descriptions[outcome]}</p>
        </div>
      </div>
    </section>
  );
}
