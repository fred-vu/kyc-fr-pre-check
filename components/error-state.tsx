import { AlertCircle } from "lucide-react";

export function ErrorState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="rounded-lg border border-[#fecaca] bg-[#fef2f2] p-4">
      <div className="flex gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 flex-none text-[#991b1b]" aria-hidden="true" />
        <div>
          <h2 className="text-sm font-medium text-[#991b1b]">{title}</h2>
          <p className="mt-1 text-sm leading-[1.55] text-[#991b1b]">{description}</p>
        </div>
      </div>
    </section>
  );
}
