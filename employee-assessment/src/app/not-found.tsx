import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="font-display text-2xl font-semibold">ไม่พบหน้าหรือไม่มีสิทธิ์เข้าถึง</h1>
      <p className="text-sm text-muted">หากคิดว่าควรเข้าถึงได้ ให้ติดต่อ HR</p>
      <Link href="/" className="text-sm text-accent underline">
        กลับหน้าแรก
      </Link>
    </div>
  );
}
