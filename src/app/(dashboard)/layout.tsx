/**
 * ログイン後の全ページ共通の枠。
 * ここでログイン確認を行い、未ログインなら /login へ戻す（二重の守り。
 * 一次防御は middleware）。ヘッダーにユーザー名とログアウトボタンを表示。
 */
import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerAuthService } from "@/lib/auth";
import { logoutAction } from "@/app/(auth)/actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getServerAuthService();
  const user = await auth.getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/projects" className="text-xl font-bold text-blue-700">
            📷 写真台帳
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-gray-500 sm:inline">
              {user.email}
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-lg border border-gray-300 px-4 py-2 text-base text-gray-700 hover:bg-gray-50"
              >
                ログアウト
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
