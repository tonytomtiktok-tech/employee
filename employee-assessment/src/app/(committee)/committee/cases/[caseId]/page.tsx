import { createSeedStore } from "@/lib/repository/seed";
import ClientPage from "./ClientPage";

export function generateStaticParams() {
  return createSeedStore().cases.map((c) => ({ caseId: c.caseId }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  return <ClientPage caseId={caseId} />;
}
