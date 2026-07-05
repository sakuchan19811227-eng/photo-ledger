/**
 * 管理画面: 操作ログの閲覧（新しい順・種類で絞り込み）。
 */
import { getAuditLogRepository } from "@/lib/repositories";
import { AUDIT_ACTIONS, type AuditAction } from "@/lib/services/audit";

function formatDateTime(date: Date): string {
  return new Date(date).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function actionLabel(action: string): string {
  return AUDIT_ACTIONS[action as AuditAction] ?? action;
}

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string }>;
}) {
  const { action } = await searchParams;
  const selected = action ?? "";
  const logs = await getAuditLogRepository().listRecent(100, selected || undefined);

  return (
    <div className="rounded-2xl bg-white p-4 shadow">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-gray-800">
          操作ログ（最新{logs.length}件）
        </h2>
        <form method="GET" className="flex gap-2">
          <select
            name="action"
            defaultValue={selected}
            className="rounded-lg border border-gray-300 px-3 py-2 text-base"
          >
            <option value="">すべての操作</option>
            {Object.entries(AUDIT_ACTIONS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-base text-gray-700 hover:bg-gray-50"
          >
            絞り込む
          </button>
        </form>
      </div>

      {logs.length === 0 ? (
        <p className="p-6 text-center text-gray-500">ログはまだありません</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 text-left text-gray-500">
                <th className="p-2">日時</th>
                <th className="p-2">実行者</th>
                <th className="p-2">操作</th>
                <th className="p-2">詳細</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-100">
                  <td className="whitespace-nowrap p-2 text-gray-600">
                    {formatDateTime(log.createdAt)}
                  </td>
                  <td className="p-2">{log.userEmail ?? "（不明）"}</td>
                  <td className="whitespace-nowrap p-2 font-medium">
                    {actionLabel(log.action)}
                  </td>
                  <td className="p-2 text-gray-500">
                    {log.metadata ? JSON.stringify(log.metadata) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
