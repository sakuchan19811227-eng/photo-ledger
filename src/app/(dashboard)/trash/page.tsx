/**
 * ゴミ箱ページ。削除（論理削除）した現場の一覧と復元。
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerAuthService } from "@/lib/auth";
import { getProjectRepository } from "@/lib/repositories";
import { RestoreProjectButton } from "@/components/projects/RestoreProjectButton";

export default async function TrashPage() {
  const auth = await getServerAuthService();
  const user = await auth.getCurrentUser();
  if (!user) redirect("/login");

  const deleted = await getProjectRepository().listDeletedByUser(user.id);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">🗑 ゴミ箱</h1>
        <Link href="/projects" className="text-base text-blue-600 underline">
          現場一覧に戻る
        </Link>
      </div>

      {deleted.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow">
          <p className="text-lg text-gray-600">ゴミ箱は空です</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {deleted.map((p) => (
            <li key={p.id} className="rounded-2xl bg-white p-5 shadow">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xl font-bold text-gray-700">{p.projectName}</p>
                  {p.customerName && (
                    <p className="text-base text-gray-500">顧客名: {p.customerName}</p>
                  )}
                </div>
                <RestoreProjectButton projectId={p.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
