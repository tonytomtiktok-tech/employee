import { redirect } from "next/navigation";
import { getShellData } from "@/lib/auth/server-data";
import { getMyCases } from "@/lib/services/cases";

export default async function MyAssessmentIndexPage() {
  const { actor } = await getShellData();
  const cases = getMyCases(actor);
  if (cases[0]) redirect(`/my-assessment/${cases[0].caseId}`);
  redirect("/");
}
