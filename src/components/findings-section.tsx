"use client";

import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { stripMarkers } from "@/lib/format";
import {
  readFindings,
  removeFinding,
  serverFindings,
  subscribeFindings,
} from "@/lib/findings-store";
import type { Finding } from "@/lib/types";
import { optionStyles } from "./option-tag";

function provenance(finding: Finding): { grounded: number; extrapolated: number } {
  const grounded = finding.citations.filter(
    (citation) => citation.source.kind !== "simulated",
  ).length;
  return { grounded, extrapolated: finding.citations.length - grounded };
}

/**
 * The research exit, folded into the record beside the transcript rather than
 * standing as its own column. Every reply a client pins lands here, across every
 * interview in the project, so the saved quotes travel with the respondent panel
 * that's already on screen. It sits above the profile because a saved finding is
 * the researcher's own work, and the profile is reference behind it.
 */
export function FindingsSection({
  activeConversationId,
}: {
  activeConversationId: string | null;
}) {
  const router = useRouter();
  const findings = useSyncExternalStore(
    subscribeFindings,
    readFindings,
    serverFindings,
  );
  // Empty, the section folds to its header so the record stays about the
  // respondent; it opens itself the moment a finding lands, until the reader
  // says otherwise.
  const [manualOpen, setManualOpen] = useState<boolean | null>(null);
  const open = manualOpen ?? findings.length > 0;

  return (
    <div className="px-6 py-5">
      <button
        type="button"
        onClick={() => setManualOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center gap-2"
      >
        <svg
          viewBox="0 0 16 16"
          aria-hidden
          className="size-4 text-ink-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 3.2c0-.4.3-.7.7-.7h6.6c.4 0 .7.3.7.7v10.3L8 10.8l-4 2.7V3.2Z" />
        </svg>
        <span className="label">Findings</span>
        {findings.length > 0 ? (
          <span className="rounded-full bg-surface-sunk px-1.5 text-[0.6875rem] font-medium text-ink-muted tabular-nums">
            {findings.length}
          </span>
        ) : null}
        <span
          aria-hidden
          className={`ml-auto text-ink-muted transition-transform duration-200 ${open ? "" : "-rotate-90"}`}
        >
          &#8964;
        </span>
      </button>

      {open ? (
        findings.length === 0 ? (
          <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink-muted">
            Nothing saved yet. Bookmark a reply during an interview to keep it
            here, sources included.
          </p>
        ) : (
          <ul className="mt-3 flex max-h-[18rem] flex-col gap-2 overflow-y-auto">
            {findings.map((finding) => {
              const { grounded, extrapolated } = provenance(finding);
              const here = finding.conversationId === activeConversationId;
              return (
                <li
                  key={finding.id}
                  className="rounded-xl border border-border bg-surface-sunk p-3"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`size-2 shrink-0 rounded-full ${optionStyles(finding.choice).dot}`}
                    />
                    <span className="min-w-0 flex-1 truncate text-[0.8125rem] font-medium text-ink">
                      {finding.personaName}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFinding(finding.id)}
                      aria-label="Remove from findings"
                      title="Remove"
                      className="flex size-6 items-center justify-center rounded-md text-ink-muted transition-colors duration-150 hover:bg-card hover:text-ink"
                    >
                      <svg
                        viewBox="0 0 16 16"
                        aria-hidden
                        className="size-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      >
                        <path d="M4 4l8 8M12 4l-8 8" />
                      </svg>
                    </button>
                  </div>

                  <p className="mt-1.5 line-clamp-3 text-[0.8125rem] leading-relaxed text-ink">
                    {stripMarkers(finding.content)}
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-grounded-soft px-2 py-0.5 text-[0.6875rem] font-medium text-grounded">
                      <span className="size-1.5 rounded-full bg-grounded" />
                      {grounded}
                    </span>
                    {extrapolated > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-simulated bg-simulated-soft px-2 py-0.5 text-[0.6875rem] font-medium text-simulated">
                        {extrapolated} extrapolated
                      </span>
                    ) : null}
                    {here ? null : (
                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/interviews/${finding.conversationId}`)
                        }
                        className="ml-auto text-[0.75rem] font-medium text-accent hover:underline"
                      >
                        Open interview
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )
      ) : null}
    </div>
  );
}
