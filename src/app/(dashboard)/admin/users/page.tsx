/**
 * 管理画面: ユーザー一覧と無効化。
 */
import { getServerAuthService } from "@/lib/auth";
import { getUserRepository } from "@/lib/repositories";
import { UserActiveToggle } from "@/components/admin/UserActiveToggle";

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("ja-JP");
}

export default async function AdminUsersPage() {
  const auth = await getServerAuthService();
  const me = await auth.getCurrentUser();
  const userList = await getUserRepository().listAll();

  return (
    <div className="overflow-x-auto rounded-2xl bg-white p-4 shadow">
      <h2 className="mb-3 text-lg font-bold text-gray-800">
        ユーザー一覧（{userList.length}人）
      </h2>
      <table className="w-full border-collapse text-base">
        <thead>
          <tr className="border-b-2 border-gray-200 text-left text-sm text-gray-500">
            <th className="p-2">名前</th>
            <th className="p-2">メールアドレス</th>
            <th className="p-2">権限</th>
            <th className="p-2">状態</th>
            <th className="p-2">登録日</th>
            <th className="p-2">操作</th>
          </tr>
        </thead>
        <tbody>
          {userList.map((u) => (
            <tr key={u.id} className="border-b border-gray-100">
              <td className="p-2">{u.name ?? "-"}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2">
                {u.role === "admin" ? (
                  <span className="rounded bg-gray-800 px-2 py-0.5 text-xs font-bold text-white">
                    管理者
                  </span>
                ) : (
                  <span className="text-sm text-gray-600">一般</span>
                )}
              </td>
              <td className="p-2">
                {u.isActive ? (
                  <span className="text-sm text-green-700">有効</span>
                ) : (
                  <span className="text-sm font-bold text-red-600">無効</span>
                )}
              </td>
              <td className="p-2 text-sm text-gray-600">{formatDate(u.createdAt)}</td>
              <td className="p-2">
                <UserActiveToggle
                  userId={u.id}
                  userEmail={u.email}
                  isActive={u.isActive}
                  isSelf={u.id === me?.id}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
