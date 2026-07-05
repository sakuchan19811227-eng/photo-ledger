/**
 * 管理画面: 削除データ確認（全ユーザーの削除済み現場・写真）。
 * 復元は各ユーザー自身のゴミ箱から行う運用のため、ここは閲覧のみ。
 */
import { getPhotoRepository, getProjectRepository } from "@/lib/repositories";

function formatDateTime(date: Date): string {
  return new Date(date).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminDeletedPage() {
  const [deletedProjects, deletedPhotos] = await Promise.all([
    getProjectRepository().listAllDeleted(),
    getPhotoRepository().listAllDeleted(),
  ]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-bold text-gray-800">
          削除済みの現場（{deletedProjects.length}件）
        </h2>
        {deletedProjects.length === 0 ? (
          <p className="p-4 text-center text-gray-500">ありません</p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 text-left text-gray-500">
                <th className="p-2">現場名</th>
                <th className="p-2">所有者</th>
                <th className="p-2">削除日時</th>
              </tr>
            </thead>
            <tbody>
              {deletedProjects.map((p) => (
                <tr key={p.id} className="border-b border-gray-100">
                  <td className="p-2 font-medium">{p.projectName}</td>
                  <td className="p-2">{p.ownerEmail ?? "（不明）"}</td>
                  <td className="p-2 text-gray-600">{formatDateTime(p.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="rounded-2xl bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-bold text-gray-800">
          削除済みの写真（{deletedPhotos.length}枚）
        </h2>
        {deletedPhotos.length === 0 ? (
          <p className="p-4 text-center text-gray-500">ありません</p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 text-left text-gray-500">
                <th className="p-2">ファイル名</th>
                <th className="p-2">所属現場</th>
                <th className="p-2">削除日時</th>
              </tr>
            </thead>
            <tbody>
              {deletedPhotos.map((p) => (
                <tr key={p.id} className="border-b border-gray-100">
                  <td className="p-2">{p.fileName}</td>
                  <td className="p-2">{p.projectName ?? "（不明）"}</td>
                  <td className="p-2 text-gray-600">{formatDateTime(p.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-sm text-gray-500">
        ※ 復元は各ユーザー自身の「ゴミ箱」画面から行えます
      </p>
    </div>
  );
}
