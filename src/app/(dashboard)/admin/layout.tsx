/**
 * 管理画面の共通枠。role=admin 以外は入れない。
 */
import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerAuthService } from "@/lib/auth";
import { getUserRepository } from "@/lib/repositories";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getServerAuthService();
  const user = await auth.getCurrentUser();
  if (!user) redirect("/login");

  const appUser = await getUserRepository().findById(user.id);
  if (!appUser || appUser.role !== "admin" || !appUser.isActive) {
    redirect("/projects"); // 管理者以外は現場一覧へ返す
  }

  const tabs = [
    { href: "/admin/users", label: "👥 ユーザー管理" },
    { href: "/admin/logs", label: "📋 操作ログ" },
    { href: "/admin/deleted", label: "🗑 削除データ" },
  ];

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-gray-800">🛠 管理画面</h1>
      <nav className="mb-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-base text-gray-700 hover:bg-gray-50"
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
