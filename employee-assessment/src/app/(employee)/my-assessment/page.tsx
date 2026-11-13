"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/providers/AppProvider";
import { getMyCases } from "@/lib/services/cases";

export default function MyAssessmentIndexPage() {
  const router = useRouter();
  const { actor } = useApp();

  useEffect(() => {
    const cases = getMyCases(actor);
    if (cases[0]) router.replace(`/my-assessment/${cases[0].caseId}`);
    else router.replace("/");
  }, [actor, router]);

  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-muted">
      กำลังเปิดแบบประเมิน...
    </div>
  );
}
