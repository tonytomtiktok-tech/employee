export function OrgDrilldown({
  people,
}: {
  people: {
    caseId: string;
    employeeCode: string;
    displayName: string;
    finalScore: number | null;
    talentSegment: string | null;
  }[];
}) {
  if (people.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted">
        ไม่มีข้อมูลรายบุคคลในขอบเขตนี้ หรือถูกจำกัดด้วยสิทธิ์/ความเป็นส่วนตัว
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs text-muted">
          <tr>
            <th className="px-4 py-3">รหัส</th>
            <th className="px-4 py-3">ชื่อ</th>
            <th className="px-4 py-3">คะแนนสุดท้าย</th>
            <th className="px-4 py-3">กลุ่ม</th>
          </tr>
        </thead>
        <tbody>
          {people.map((p) => (
            <tr key={p.caseId} className="border-t border-border">
              <td className="px-4 py-3">{p.employeeCode}</td>
              <td className="px-4 py-3">{p.displayName}</td>
              <td className="px-4 py-3">{p.finalScore ?? "—"}</td>
              <td className="px-4 py-3">{p.talentSegment ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
