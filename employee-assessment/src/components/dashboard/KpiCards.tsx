import { Card } from "@/components/ui/card";

export function KpiCards({
  totals,
}: {
  totals: {
    employeesInScope: number;
    selfSubmitted: number;
    managerSubmitted: number;
    finalized: number;
    published: number;
    overdue: number;
  };
}) {
  const items = [
    { label: "พนักงานในขอบเขต", value: totals.employeesInScope },
    { label: "ส่งประเมินตนเอง", value: totals.selfSubmitted },
    { label: "หัวหน้าส่งแล้ว", value: totals.managerSubmitted },
    { label: "สรุปผลแล้ว", value: totals.finalized },
    { label: "เผยแพร่แล้ว", value: totals.published },
    { label: "เกินกำหนด", value: totals.overdue },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label} className="!p-4">
          <p className="text-xs text-muted">{item.label}</p>
          <p className="mt-2 font-display text-3xl font-semibold">{item.value}</p>
        </Card>
      ))}
    </div>
  );
}
